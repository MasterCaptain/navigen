#!/usr/bin/env python3
"""
Convert Kartverket GeoJSON to NAVIGEN TypeScript format

CRITICAL: GeoJSON uses [lng, lat] but NAVIGEN uses [lat, lng]

Usage:
    python3 convert_kartverket_geojson.py norway_12nm.geojson > output.ts
    
Or for multiple features:
    python3 convert_kartverket_geojson.py --all norway_12nm.geojson

Features:
- Swaps [lng, lat] to [lat, lng]
- Handles FeatureCollection and single Feature
- Validates polygon closure
- Simplifies coordinates if too many (optional)
- Generates TypeScript array format
"""

import json
import sys
import argparse
from typing import List, Tuple

def convert_coordinates(coords: List[List[float]]) -> List[Tuple[float, float]]:
    """
    Convert GeoJSON coordinates [lng, lat] to NAVIGEN format [lat, lng]
    
    Args:
        coords: List of [longitude, latitude] pairs
        
    Returns:
        List of (latitude, longitude) tuples
    """
    converted = []
    for coord in coords:
        if len(coord) >= 2:
            lng, lat = coord[0], coord[1]
            # Swap to [lat, lng]
            converted.append((lat, lng))
    return converted

def simplify_coordinates(coords: List[Tuple[float, float]], max_points: int = 5000) -> List[Tuple[float, float]]:
    """
    Simplify polygon if it has too many points (basic nth-point selection)
    
    For production, consider using Douglas-Peucker algorithm instead:
    pip install rdp
    from rdp import rdp
    return rdp(coords, epsilon=0.001)
    
    Args:
        coords: List of coordinate tuples
        max_points: Maximum number of points to keep
        
    Returns:
        Simplified list of coordinates
    """
    if len(coords) <= max_points:
        return coords
    
    # Keep every nth point
    step = len(coords) // max_points
    simplified = coords[::step]
    
    # Ensure first and last points are included for closure
    if simplified[-1] != coords[-1]:
        simplified.append(coords[-1])
    
    print(f"# Simplified from {len(coords)} to {len(simplified)} points", file=sys.stderr)
    return simplified

def validate_polygon(coords: List[Tuple[float, float]]) -> bool:
    """
    Validate polygon requirements
    
    Args:
        coords: List of coordinate tuples
        
    Returns:
        True if valid, False otherwise
    """
    if len(coords) < 4:  # Minimum for closed polygon (3 unique + 1 closure)
        print(f"# WARNING: Polygon has only {len(coords)} points (minimum 4 for closure)", file=sys.stderr)
        return False
    
    # Check if polygon is closed (first == last)
    if coords[0] != coords[-1]:
        print(f"# WARNING: Polygon not closed! First: {coords[0]}, Last: {coords[-1]}", file=sys.stderr)
        print(f"# Auto-closing by adding first point to end", file=sys.stderr)
        return False
    
    return True

def format_typescript(coords: List[Tuple[float, float]], var_name: str = "COORDINATES") -> str:
    """
    Format coordinates as TypeScript array
    
    Args:
        coords: List of coordinate tuples
        var_name: Variable name for TypeScript constant
        
    Returns:
        TypeScript formatted string
    """
    output = f"const {var_name}: LatLng[] = [\n"
    for lat, lng in coords:
        output += f"  [{lat}, {lng}],\n"
    output += "];\n"
    return output

def process_geojson(filepath: str, simplify: bool = False, max_points: int = 5000, all_features: bool = False):
    """
    Process GeoJSON file and output TypeScript format
    
    Args:
        filepath: Path to GeoJSON file
        simplify: Whether to simplify coordinates
        max_points: Maximum points if simplifying
        all_features: Process all features (True) or just first (False)
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle both FeatureCollection and single Feature
    if data.get('type') == 'FeatureCollection':
        features = data.get('features', [])
    elif data.get('type') == 'Feature':
        features = [data]
    else:
        print("# ERROR: Invalid GeoJSON format (not Feature or FeatureCollection)", file=sys.stderr)
        sys.exit(1)
    
    if not features:
        print("# ERROR: No features found in GeoJSON", file=sys.stderr)
        sys.exit(1)
    
    # Print header
    print("// Converted from Kartverket GeoJSON")
    print(f"// Source file: {filepath}")
    print(f"// Features found: {len(features)}")
    print(f"// Coordinates format: [lat, lng] (converted from GeoJSON [lng, lat])")
    print()
    print("import type { LatLng } from '../geoTriggers';")
    print()
    
    # Process features
    features_to_process = features if all_features else [features[0]]
    
    for idx, feature in enumerate(features_to_process):
        geometry = feature.get('geometry', {})
        geom_type = geometry.get('type')
        
        if geom_type not in ['Polygon', 'MultiPolygon']:
            print(f"# WARNING: Feature {idx} is {geom_type}, skipping (only Polygon/MultiPolygon supported)", file=sys.stderr)
            continue
        
        # Extract coordinates
        if geom_type == 'Polygon':
            # Polygon: [ [[lng, lat], [lng, lat], ...] ]
            rings = geometry.get('coordinates', [])
            if not rings:
                print(f"# WARNING: Feature {idx} has no coordinates", file=sys.stderr)
                continue
            
            # Use outer ring only (ignore holes)
            outer_ring = rings[0]
            coords = convert_coordinates(outer_ring)
            
        elif geom_type == 'MultiPolygon':
            # MultiPolygon: [ [ [[lng, lat], ...] ], [ [[lng, lat], ...] ] ]
            # For simplicity, just use the first polygon
            print(f"# WARNING: Feature {idx} is MultiPolygon, using only first polygon", file=sys.stderr)
            polygons = geometry.get('coordinates', [])
            if not polygons:
                print(f"# WARNING: Feature {idx} has no coordinates", file=sys.stderr)
                continue
            
            outer_ring = polygons[0][0]  # First polygon, outer ring
            coords = convert_coordinates(outer_ring)
        
        # Validate and auto-close if needed
        is_valid = validate_polygon(coords)
        if not is_valid and coords[0] != coords[-1]:
            # Auto-close polygon
            coords.append(coords[0])
        
        # Simplify if requested
        if simplify:
            coords = simplify_coordinates(coords, max_points)
        
        # Generate variable name
        var_name = f"NORWAY_REGION_{idx}" if all_features and len(features) > 1 else "NORWAY_MAINLAND_12NM"
        
        # Print statistics
        print(f"// Feature {idx}: {len(coords)} coordinates")
        properties = feature.get('properties', {})
        if properties:
            print(f"// Properties: {properties}")
        
        # Output TypeScript
        print(format_typescript(coords, var_name))
    
    # Print footer with usage instructions
    print()
    print("// USAGE:")
    print("// 1. Copy the coordinates above")
    print("// 2. Paste into /data/polygons/norwayTerritorial.ts")
    print("// 3. Replace the TEMPORARY PLACEHOLDER coordinates")
    print("// 4. Rename norwayTerritorial.TEMPLATE.ts to norwayTerritorial.ts")
    print("// 5. Uncomment the import in /data/polygons/territorial.ts")
    print("// 6. Test in Norwegian fjords - should show COASTAL instead of HIGH SEAS")

def main():
    parser = argparse.ArgumentParser(
        description='Convert Kartverket GeoJSON to NAVIGEN TypeScript format',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert first feature only (most common)
  python3 convert_kartverket_geojson.py norway_12nm.geojson > output.ts
  
  # Convert all features (if multiple regions in one file)
  python3 convert_kartverket_geojson.py --all norway_12nm.geojson > output.ts
  
  # Simplify to max 3000 points (if too large)
  python3 convert_kartverket_geojson.py --simplify --max-points 3000 norway_12nm.geojson > output.ts
  
  # Redirect output to file
  python3 convert_kartverket_geojson.py norway_12nm.geojson > norway_coordinates.ts
        """
    )
    
    parser.add_argument('geojson_file', help='Path to Kartverket GeoJSON file')
    parser.add_argument('--simplify', action='store_true', help='Simplify coordinates if too many')
    parser.add_argument('--max-points', type=int, default=5000, help='Maximum points when simplifying (default: 5000)')
    parser.add_argument('--all', action='store_true', dest='all_features', help='Process all features (default: first only)')
    
    args = parser.parse_args()
    
    try:
        process_geojson(args.geojson_file, args.simplify, args.max_points, args.all_features)
    except FileNotFoundError:
        print(f"# ERROR: File not found: {args.geojson_file}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"# ERROR: Invalid JSON in file: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"# ERROR: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
