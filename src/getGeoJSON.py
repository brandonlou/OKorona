#!/usr/bin/python

from sys import argv
from os.path import exists
import json
script, in_file, out_file = argv

data = json.load(open(in_file))

geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(data[d]["longitude"]) if data[d]["longitude"] else 0, float(data[d]["latitude"]) if data[d]["latitude"] else 0]
                },
                "properties": data[d]
            }
            for d in data
        ]
}

# parsed = json.dumps(geojson, indent=4, sort_keys=True)

output = open(out_file, 'w')

json.dump(geojson, output)

