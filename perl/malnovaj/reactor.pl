#!/usr/bin/perl -w

# (c) 2004 by Wolfram Diestel <diestel@steloj.de>
# distribution permitted under GPL 2.0 or later

use IO::Handle;
use XML::Parser;

$verbose=1;

#$DB::fork_TTY = "/dev/pts/0";

# TODO: 
# 
# error handling (SIGPIPE, not existing process etc.)



# This program can interconnect a tree like structure of processes 
# each other with pipes. The processes itself are normal command line
# programs reading from stdin and writing to stdout. This tool will ensure
# that stdin of each process comes from stdout of the predecessor process
# One process can have several successors but only one predecessor.
# Before the output from de predecessor is sent to a process, it
# receives some control data as given in the second field in %processes
#
# Naming conventions:
#   Rn  = filehandle, from which process n is reading
#   Wn  = filehandle, to which predecessor of process n is writing,
#         t.e. sending data to process n
#   Pn  = auxilary filehandle to process n on which first are
#         sent the control data to process n, then the data coming from Rn
#
# only needed for processes 
# with several successors:
#   XRn = file handle from which data from process n are read for dispatching
#         to several successors
#   XWn = file handle to which process n is writing for dispatching to its
#         successors
#
# This programm creates two or three subprocesses for every "process n"
# for processes with several successors a pair of processes is doing (a) 
# writing control and predecessor data to the process and (b) dispatching 
# data to its successors. And (c) is the process itself launched 
# implicitely with the pipe open function. For processes with only one
# or no successor only (a) and (c) are needed.
# 


%processes = ();
#    1 => [0,"cat","<uvw>\n"],
#    2 => [1,"cat","<123>"],
#    3 => [1,"wc",""],
#    4 => [1,"wc",""],
#    5 => [2,"cat",""],	     
#    6 => [3,"cat",""],	     
#    7 => [4,"wc",""]     
#
#qs{
#            <ctrl>
#              <sort_where element="files"/>
#              <sort_what element="file"/>
#              <sort_key key="."/>
#	    </ctrl>
#	    }]
#    );

%succ = ();
@pids = ();

# read in process configuration
xml_read_config();



# get source processes (processes without a predecessor)
makesuccarr();
@src = get_source_procs();
dump_process_tree(0,@src) if ($verbose);

# launch them and recursively theire successors
foreach $proc (@src) { launch_proc_and_succ($proc); }

# wait for the child processes
foreach $pid (@pids) { waitpid($pid,0); }

# ready
exit;

##################################################

sub PRE() {0};
sub CMD() {1};
sub CTL() {2};

sub predecessor { 
    my $proc = shift;
    return $processes{$proc}->[PRE]; 
}
sub command { 
    my $proc = shift;
    return $processes{$proc}->[CMD]; 
}
sub controldata { 
    my $proc = shift;
    return $processes{$proc}->[CTL]; 
}
sub successor {
    my ($proc,$n) = @_;
    $n = 0 unless ($n);
    return unless (defined($succ{$proc}));
    return $succ{$proc}->[$n];
}
sub successors { 
    my $proc = shift;
    return () unless ($succ{$proc});
    return @{$succ{$proc}} 
}

sub makesuccarr {
    foreach $proc (keys %processes) {
	my $pred = predecessor($proc);
	if  ($pred) {
	    if (defined($succ{$pred})) {
		push @{$succ{$pred}}, $proc
		} else {
		    $succ{$pred} = [$proc];
		}
	}
    }
}

# which are the source processes,
# t.e. which haven`t a predecessor
sub get_source_procs {
    my @src = ();

    foreach $proc (keys %processes) {
	unless (predecessor($proc)) {
	    push @src, $proc;
	}
    }

    return @src;
}

# launch a process and all successors recursively
sub launch_proc_and_succ {
    my $proc = shift;

    launch_proc($proc);

    foreach $s (successors($proc)) {
	launch_proc_and_succ($s);
    }
}

# launch a process by forking it from the parent process
# this includes creating pipes to its successors and
# dispathcing the data, if there are more then one successor
sub launch_proc {
    my $proc = shift;
    my $pid;

    # create pipes to successors
    foreach $s (successors($proc)) {
	pipe ( "R$s", "W$s" );
	"W$s"->autoflush(1);
    }

    # fork for $proc
    if ($pid = fork) {
	# parent: close read end of pipe from predecessor
	close "R$proc" if (predecessor($proc));

	# close write ends to successors
	foreach $s (successors($proc)) { close "W$s"; }

	
    } else {
	# child: close write end of pipe to predecessor 
	close "W$proc" if (predecessor($proc));

	# close read ends op pipes to successors
	foreach $s (successors($proc)) { close "R$s"; }

	# only one or no successor - redirection of stdout is enough
	if (not successors($proc) or (1+successors($proc) <= 1)) {

	    # redirect STDOUT to write end of pipe to succ
	    open STDOUT, ">&W".successor($proc) if (successor($proc));

	    # start the process itself
	    do_process($proc);

	    # close file handles 
	    close "R$proc" if (predecessor($proc));
	    close "W".successor($proc) if (successor($proc));

	# if there are several successors, dispatching of
	# data is needed
	} else {

	   # we need another pipe, through which the
	   # process can send the data, that we want to dispatch
	   pipe("XR$proc","XW$proc");
	   "XW$proc"->autoflush(1);

	   # start the process itself
	   my $childpid = do_process_X($proc);

	   # process is launched, now we can dispatch 
	   # the data coming through the X-pipe to the successors
	   while (readline("XR$proc")) {
	       foreach $s (successors($proc)) {
		   print {"W$s"} $_;
	       }
	   }

	   # close all file handles 
	   close "R$proc" if (predecessor($proc));
	   close "XR$proc";
	   foreach $s (successors($proc)) { close "W$s"; }

           # wait until the subprocess started by do_process_X ends
	   waitpid($childpid,0);
	}

	# exit this child process
	exit;
    }

    # add pid to array, after the parent has created all
    # the successors (done all work), it will wait for this
    # pid to end before exiting itself
    push @pids, $pid;
}

sub do_process {
    my $proc = shift;

    # launch the process with open
    open "P$proc","|".command($proc);

    # first write control data to process
    print {"P$proc"} controldata($proc);

    # now, if there is a predecessor, foward
    # all the data coming from this to the process
    if (predecessor($proc)) {
	while (readline("R$proc")) { print {"P$proc"} $_ }
    }

    # close file handles 
    close "P$proc";
}

sub do_process_X {
    my $proc = shift;
    my $pid;

    # start another child process, which writes first the control
    # data an then the data from the predecessor to the process
    if ($pid = fork) {
	# parent process
	
	# if there is a dispatching pipe, close its write end
	close "XW$proc";

	# parent proceeds eventually reading from the child process
	return $pid;

    } else {
	# child launches the process and provides it with data

	# if there is a dispatching pip, close it's read end
	# and redirect STDOUT to it's write end
	close "XR$proc";
	open STDOUT, ">&XW$proc";

	# finally launch the process with open
	open "P$proc","|".command($proc);

	# first write control data to process
	print {"P$proc"} controldata($proc);

	# now, if there is a predecessor, foward
	# all the data coming from this to the process
	if (predecessor($proc)) {
	    while (readline("R$proc")) { print {"P$proc"} $_ }
	}

	# close file handles and exit
	close "P$proc";
	close "XW$proc";
	exit;
    }
}

sub xml_read_config {
    my $parser = new XML::Parser(ParseParamEnt => 1,
				 ErrorContext => 2,
				 NoLWP => 1,
				 Handlers => {
				     Start => \&xml_start_el,
				     End   => \&xml_end_el,
				     Char  => \&xml_char}
				 );
    eval { $parser->parse(*STDIN) }; warn "$@" if ($@);

    # check if given process information are ok
    foreach $proc (keys %processes) {
	my $procprops = $processes{$proc};
	die "Predecessor ".$procprops->[PRE]." of process $proc ".
	    "doesn't reference to a defined process.\n" if
		($procprops->[PRE] and 
		 not defined $processes{$procprops->[PRE]});
	die "Command not given for process $proc.\n" unless
	    ($procprops->[CMD]);
    }
}

sub xml_start_el {
    my ($xp,$el,@attrs) = @_;

    if ($el eq 'process') {
	$xml_cmd = '';
	$xml_ctl = '';

	$xml_procid = xml_get_attr('id',@attrs);
	die "Process id not given.\n" unless ($xml_procid);
	die "Process id should be an integer.\n" 
	    unless ($xml_procid =~ /^\d+$/);

	$xml_predid = xml_get_attr('pred',@attrs);
	die "Predecessor should be an integer.\n"
	    unless ($xml_predid =~ /^\d*$/);

    } elsif ($xp->in_element('ctl')) {
	# copy all data including xml tags
	my $attr_str = xml_attr_str(@attrs);
	$xml_ctl .= "<$el$attr_str>"; 
    }
}


sub xml_end_el {
    my ($xp, $el) = @_;

    if ($el eq 'process') {
	$processes{$xml_procid} = [$xml_predid,$xml_cmd,$xml_ctl];
    } elsif ($xp->in_element('ctl')) {
	# copy close tag
	$xml_ctl .= "</$el>"; 
    }
}


sub xml_char {
    my ($xp, $text) = @_;

    if  (length($text)) {
	if ($xp->in_element('cmd')) {
	    $xml_cmd .= $text;  #$xp->xml_escape($text);
	} elsif ($xp->in_element('ctl')) {
	    $xml_ctl .= $text; #$xp->xml_escape($text);
	}
    }
}

sub xml_get_attr {
    my($attr_name,@attr_list)=@_;

    while (@attr_list) {
        if (shift @attr_list eq $attr_name) {
            return shift @attr_list
            };
    };
    return ''; # not found
};

sub xml_attr_str {
    my $result='';

    while (@_) {
        my $attr_name = shift @_;
        my $attr_val  = shift @_;
        $result .= " $attr_name=\"$attr_val\"";
    }

    return $result;
}

sub dump_process_tree {
    my ($indent,@procs) = @_;

    foreach $proc (@procs) {
	print " " x $indent . "$proc: ".command($proc)."\n";
	dump_process_tree($indent+2,successors($proc));
    }
}

