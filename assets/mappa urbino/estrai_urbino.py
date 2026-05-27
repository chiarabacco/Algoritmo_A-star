import osmnx as ox
import json

print("1/2 - Scaricamento dati: Strade + Monumenti + Piazze (Migliorato)...")
centro = (43.7243, 12.6366)

# Scarica la rete stradale pedonale
G = ox.graph_from_point(centro, dist=700, network_type="walk")

# Tag per catturare edifici storici e piazze
tags = {
    "building": True,
    "historic": True,
    "place": "square"
}

features_osm = None
if hasattr(ox, 'features_from_point'):
    try: features_osm = ox.features_from_point(centro, tags=tags, dist=600)
    except Exception: pass

if features_osm is None or features_osm.empty:
    try: features_osm = ox.geometries_from_point(centro, tags=tags, dist=600)
    except Exception: pass

mappa_urbino = {"nodes": {}, "edges": [], "buildings": []}

# Salva i Nodi della rete stradale
for node_id, data in G.nodes(data=True):
    mappa_urbino["nodes"][str(node_id)] = {
        "id": node_id, "lat": data['y'], "lng": data['x']
    }

# Salva le Strade
for u, v, data in G.edges(data=True):
    lunghezza = data.get('length', 0)
    mappa_urbino["edges"].append({
        "from": str(u), "to": str(v), "distance": round(lunghezza, 2)
    })

# Salva Elementi Storici, Edifici e Piazze
if features_osm is not None and not features_osm.empty:
    for idx, row in features_osm.iterrows():
        if hasattr(row, 'geometry') and row.geometry:
            nome_reale = row.get('name', None)
            if nome_reale and str(nome_reale) != 'nan':
                if isinstance(nome_reale, list): 
                    nome_reale = nome_reale[0]
                
                # Determina il tipo
                tipo = "monumento"
                if row.get('place') == 'square':
                    tipo = "piazza"
                elif row.get('historic') and str(row.get('historic')) != 'nan':
                    tipo = "storico"

                # Gestione Geometria: Se è un Poligono (Edifici/Alcune piazze)
                if row.geometry.geom_type in ['Polygon', 'MultiPolygon']:
                    if row.geometry.geom_type == 'Polygon':
                        coords = [[lat, lng] for lng, lat in row.geometry.exterior.coords]
                    else:
                        coords = [[lat, lng] for lng, lat in list(row.geometry.geoms)[0].exterior.coords]
                    
                    mappa_urbino["buildings"].append({
                        "name": str(nome_reale),
                        "type": tipo,
                        "geom_type": "polygon",
                        "geometry": coords
                    })
                
                # Gestione Geometria: Se è un Punto (Tipico delle piazze su OpenStreetMap)
                elif row.geometry.geom_type == 'Point':
                    coords = [row.geometry.y, row.geometry.x] # [lat, lng]
                    mappa_urbino["buildings"].append({
                        "name": str(nome_reale),
                        "type": tipo,
                        "geom_type": "point",
                        "geometry": coords
                    })

print(f"-> Fatto! Esportati {len(mappa_urbino['edges'])} segmenti e {len(mappa_urbino['buildings'])} luoghi d'interesse.")
with open('mappa_urbino.json', 'w', encoding='utf-8') as f:
    json.dump(mappa_urbino, f, indent=4, ensure_ascii=False)

print("✅ JSON RIGENERATO!")
