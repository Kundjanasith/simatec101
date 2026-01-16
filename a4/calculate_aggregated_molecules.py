
import numpy as np

def box_lengths_from_vertices(box_vertices):
    """
    box_vertices: array-like shape (8, 3)
    Returns box lengths Lx, Ly, Lz
    """
    box = np.array(box_vertices)
    Lx = box[:, 0].max() - box[:, 0].min()
    Ly = box[:, 1].max() - box[:, 1].min()
    Lz = box[:, 2].max() - box[:, 2].min()
    return np.array([Lx, Ly, Lz])


def pbc_distance(r1, r2, box_lengths):
    dr = r1 - r2
    dr -= box_lengths * np.round(dr / box_lengths)
    return np.linalg.norm(dr)


def count_aggregated_molecules(positions, box_vertices, cutoff):
    """
    positions: list or array of shape (N, 3)
    box_vertices: list or array of shape (8, 3)
    cutoff: aggregation cutoff distance

    Returns:
        num_aggregated: number of molecules in aggregates
        clusters: list of clusters (each cluster is list of indices)
    """
    positions = np.array(positions)
    N = len(positions)
    box_lengths = box_lengths_from_vertices(box_vertices)

    # adjacency list
    neighbors = {i: set() for i in range(N)}

    for i in range(N):
        for j in range(i + 1, N):
            d = pbc_distance(positions[i], positions[j], box_lengths)
            if d <= cutoff:
                neighbors[i].add(j)
                neighbors[j].add(i)

    # find connected components
    visited = set()
    clusters = []

    for i in range(N):
        if i not in visited:
            stack = [i]
            cluster = []
            while stack:
                node = stack.pop()
                if node not in visited:
                    visited.add(node)
                    cluster.append(node)
                    stack.extend(neighbors[node] - visited)
            clusters.append(cluster)

    # aggregated molecules = clusters with size >= 2
    aggregated_clusters = [c for c in clusters if len(c) >= 2]
    num_aggregated = sum(len(c) for c in aggregated_clusters)

    return num_aggregated, aggregated_clusters


positions = [
    [0.1, 0.2, 0.3],
    [0.15, 0.25, 0.35],
    [5.0, 5.0, 5.0],
    [5.1, 5.1, 5.1],
    [9.0, 9.0, 9.0]
]

box_vertices = [
    [0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10],
    [10, 10, 0], [10, 0, 10], [0, 10, 10], [10, 10, 10]
]



def is_float_with_dot(value: str) -> bool:
        try:
            float(value)
            return '.' in value
        except ValueError:
            return False

def get_all_molecules(path):
    arr = []
    temp = []
    flag = False
    for l in open(path,'r'):
        # print(l)
        if flag:
            temp.append(l)
        if 'ENDMDL' in l:
            flag = False
            arr.append(temp)
            temp = []
        if 'MODEL' in l:
            flag = True 

    arr_x = []
    arr_y = []
    arr_z = []
    # print(len(arr))
    # print(arr[0][0].split())
        
    arr_else = []
    for a in arr:
        for l in a:
            temp = 0
            for c in l.split():
                if is_float_with_dot(c):
                    temp = temp + 1 
                    if temp == 1:
                        arr_x.append(float(c))
                    elif temp == 2:
                        arr_y.append(float(c))
                    elif temp == 3:
                        arr_z.append(float(c))
                    else:
                        arr_else.append(float(c))
    results = []
    for i in range(len(arr_x)):
        results.append([arr_x[i],arr_y[i],arr_z[i]])
    return results 

def get_all_molecules_frame(path,frame):
    arrx = []
    temp = []
    flag = False
    for l in open(path,'r'):
        # print(l)
        if flag:
            temp.append(l)
        if 'ENDMDL' in l:
            flag = False
            arrx.append(temp)
            temp = []
        if 'MODEL' in l:
            flag = True 
    
    arr = [arrx[frame]]

    arr_x = []
    arr_y = []
    arr_z = []
    # print(len(arr))
    # print(arr[0][0].split())
        
    arr_else = []
    for a in arr:
        for l in a:
            temp = 0
            for c in l.split():
                if is_float_with_dot(c):
                    temp = temp + 1 
                    if temp == 1:
                        arr_x.append(float(c))
                    elif temp == 2:
                        arr_y.append(float(c))
                    elif temp == 3:
                        arr_z.append(float(c))
                    else:
                        arr_else.append(float(c))
    results = []
    for i in range(len(arr_x)):
        results.append([arr_x[i],arr_y[i],arr_z[i]])
    return results 

def calculate_bbox(input_path):
    print(input_path)
    arr = []
    temp = []
    flag = False
    for l in open(input_path,'r'):
        # print(l)
        if flag:
            temp.append(l)
        if 'ENDMDL' in l:
            flag = False
            arr.append(temp)
            temp = []
        if 'MODEL' in l:
            flag = True 

    arr_x = []
    arr_y = []
    arr_z = []
    # print(len(arr))
    # print(arr[0][0].split())
        
    arr_else = []
    for a in arr:
        for l in a:
            temp = 0
            for c in l.split():
                if is_float_with_dot(c):
                    temp = temp + 1 
                    if temp == 1:
                        arr_x.append(float(c))
                    elif temp == 2:
                        arr_y.append(float(c))
                    elif temp == 3:
                        arr_z.append(float(c))
                    else:
                        arr_else.append(float(c))
    # print(len(arr_x),len(arr_y),len(arr_z),len(arr_else))
    # print('X',max(arr_x),min(arr_x))
    # print('Y',max(arr_y),min(arr_y))
    # print('Z',max(arr_z),min(arr_z))

    halfX = (max(arr_x)-min(arr_x))/2
    halfY = (max(arr_y)-min(arr_y))/2
    halfZ = (max(arr_z)-min(arr_z))/2
    halfX = halfX+min(arr_x)
    halfY = halfY+min(arr_y)
    halfZ = halfZ+min(arr_z) 
    corners = [
        [-(halfX +halfX), -(halfY +halfY), -(halfZ +halfZ)],
        [(halfX +halfX), -(halfY +halfY), -(halfZ +halfZ)],
        [-(halfX +halfX), (halfY +halfY), -(halfZ +halfZ)],
        [(halfX +halfX), (halfY +halfY), -(halfZ +halfZ)],
        [-(halfX +halfX), -(halfY +halfY), (halfZ +halfZ)],
        [(halfX +halfX), -(halfY +halfY), (halfZ +halfZ)],
        [-(halfX +halfX), (halfY +halfY), (halfZ +halfZ)],
        [(halfX +halfX), (halfY +halfY), (halfZ +halfZ)],
    ]        
    return corners

p = 'single_C8C10C12/C8_multiframe.pdb'

list_p = [
    'single_C8C10C12/C8_multiframe.pdb',
    'single_C8C10C12/C10_multiframe.pdb',
    'single_C8C10C12/C12_multiframe.pdb',
    'mixed_C8C10C12/C8C10C12_111_multiframe.pdb',
    'mixed_C8C10C12/C8C10C12_112_multiframe.pdb',
    'mixed_C8C10C12/C8C10C12_121_multiframe.pdb',
    'mixed_C8C10C12/C8C10C12_122_multiframe.pdb',
    'mixed_C8C10C12/C8C10C12_211_multiframe.pdb',
    'mixed_C8C10C12/C8C10C12_212_multiframe.pdb',
    'mixed_C8C10C12/C8C10C12_221_multiframe.pdb',
]



results = []
for p in list_p:
    box_vertices = calculate_bbox(p)
    cutoff_nm = 0.1
    cutoff = cutoff_nm * 10.0  # convert nm -> Å
    temp = []
    for f in range(101):
        print(f)
        positions = get_all_molecules_frame(p,f)
        num_agg, clusters = count_aggregated_molecules(
            positions, box_vertices, cutoff
        )
        print("Aggregated molecules:", num_agg)
        temp.append(num_agg)
    results.append(temp)

out_p = open('calculate_aggregated_molecules.csv','w')
str_x = ''
for p in list_p:
    str_x += p + ','
out_p.write(str_x[:-1]+'\n')
for i in range(101):
    out_p.write('%f,%f,%f,%f,%f,%f,%f,%f,%f,%f\n'%(
        results[0][i],
        results[1][i],
        results[2][i],
        results[3][i],
        results[4][i],
        results[5][i],
        results[6][i],
        results[7][i],
        results[8][i],
        results[9][i],
    ))
out_p.close()
    # print("Clusters:", clusters)

# Molecular aggregation was quantified by identifying connected clusters based on a distance cutoff of 
# r, where molecules separated by less than r were considered bonded. 
# The number of aggregated molecules was defined as the total number of molecules belonging to clusters of size two or larger, computed using a graph-based connectivity analysis with periodic boundary conditions.