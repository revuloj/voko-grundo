#!/bin/bash

# from: https://github.com/leifgehrmann/svg-stroke-to-path/

display_help() {
    echo
    echo "Usage: svg-stroke-to-path select_method select_attr file ..."
    echo
    echo "  select_method can be one of:"
    echo "    * All - Select all objects"
    echo "    * AllInAllLayers - Select all objects in all visible and"
    echo "      unlocked layers"
    echo "    * SameFillStroke - Select all objects with the same fill"
    echo "      and stroke as the selected objects"
    echo "    * SameFillColor - Select all objects with the same fill"
    echo "      as the selected objects"
    echo "    * SameStrokeColor - Select all objects with the same"
    echo "      stroke as the selected objects"
    echo "    * SameStrokeStyle - Select all objects with the same stroke"
    echo "      style (width, dash, markers) as the selected objects"
    echo
    echo "  select_attr can be a variety of SVG attributes, for example:"
    echo "    * 'stroke=\"#000\"'"
    echo "    * 'fill=\"#000\"'"
    echo "    * 'stroke=\"red\" stroke-weight=\"2\"'"
    echo
}

if [[ "$1" == "-h" ]]; then
  display_help
  exit 0
fi

inkscape_bin=NULL
inkscape_bin_version=NULL
inkscape_bin_name=inkscape
inkscape_bin_macos_path=\
"/Applications/Inkscape.app/Contents/MacOS/Inkscape"

verify_inkscape_is_installed() {
    if [[ -x "$(command -v ${inkscape_bin_name})" ]]; then
        inkscape_bin=${inkscape_bin_name}
        return
    elif [[ -f ${inkscape_bin_macos_path} ]]; then
        inkscape_bin=${inkscape_bin_macos_path}
        return
    fi

    echo 'Error: inkscape is not installed.' >&2
    exit 1
}

verify_inkscape_is_installed

read_inkscape_version() {
    inkscape_bin_version=`${inkscape_bin} -V | grep -o "[0-9]\+\.[0-9.]\+"`
}

read_inkscape_version

# Used later to distinguish between 0.92 and 1.0
semver_greater_than() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1";
}

# Read the arguments
select_method=$1
select_attr=$2
shift 2

# Validate that select method is a valid string
case ${select_method} in
    All|\
    AllInAllLayers|\
    SameFillStroke|\
    SameFillColor|\
    SameStrokeColor|\
    SameStrokeStyle);;
    *)
    display_help;
    echo "Error: select_method '$select_method' is not valid"
    exit 1;;
esac

# Validate that the select attr is set
if [[ -z "$select_attr" ]]; then
    display_help
    echo "Error: select_attr required"
    exit 1
fi

validate_file() {
    # Validate that input_filename exists
    if [[ ! -f "$1" ]]; then
        display_help
        echo "Error: input_filename '$1' not found"
        exit 1
    fi

    # Validate that content contains closing `svg` tag
    if ! grep -q "</svg>" "$1"; then
        display_help
        echo "Error: input_filename '$1' not valid SVG"
        exit 1
    fi
}

for file in "$@"
do
    validate_file "$file"
done

convert_file() {
    select_method=$1
    select_attr=$2
    input_filename=$3

    # Read input file
    input_content=`cat "$input_filename"`

    # Get position of closing `svg` tag in the SVG
    svg_close_index=`echo "$input_content" | grep -b -o "</svg>" | cut -d: -f1`

    # Generate the "selector" element
    selector_object_id='_StrokeToPathSelectorObject'
    selector_object="    <path\
     id=\"${selector_object_id}\"\
     ${select_attr}\
     d=\"M0 0 H 0\"/>\n"

    # Insert "selector" element into the SVG
    modified_input="${input_content:0:$svg_close_index}\
    $selector_object\
    ${input_content:$svg_close_index}"

    # Store the new SVG
    echo "$modified_input" > "$input_filename"

    # Convert stroke to path by selecting the "selector" element and use
    # Inkscape's selector query to select similar objects and convert
    # stroke to path
    # For more information on Inkscape's command line, see:
    # http://wiki.inkscape.org/wiki/index.php/Using_the_Command_Line
    if semver_greater_than ${inkscape_bin_version} 1; then
        # Post 0.92.x (Essentially 1.0)
        ${inkscape_bin} --batch-process \
            --select=${selector_object_id}\
            --verb "EditSelect$select_method;StrokeToPath;FileSave"\
            "$input_filename"
    else
        # 0.92.x
        ${inkscape_bin} -f "$input_filename"\
            --select=${selector_object_id}\
            --verb="EditSelect$select_method"\
            --verb="StrokeToPath"\
            --verb="EditDeselect"\
            --select=${selector_object_id}\
            --verb="EditDelete"\
            --verb="FileSave"\
            --verb="FileQuit"
    fi
}

for file in "$@"
do
    convert_file ${select_method} "$select_attr" `pwd`"/$file"
done
