#!/bin/sh

set -u
set -e
set -x

for file in *.svg ; do
        echo "$file"

        maxpng="$(echo "$file" |sed "s/.svg$/-max.png/")"
        inkscape \
            --without-gui \
            "--file=$file" \
            "--export-width=4096" \
            "--export-png=${maxpng}"

        for size in 4096 2048 1024 512 256 128 100 96 64 48 32 16 ; do
                smallpng="$(echo "$file" |sed "s/.svg$/-${size}.png/")"
                echo "$smallpng"

				convert -filter Lanczos -resize "${size}x${size}" \
					"$maxpng" \
					"$smallpng"
        done
done

