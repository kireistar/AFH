import os
import re

def resolve_file_conflict(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    if '<<<<<<<' not in content:
        return False

    # Regex pattern to match git conflict blocks:
    # <<<<<<< ...
    # [upstream]
    # =======
    # [stashed]
    # >>>>>>> ...
    pattern = re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', re.DOTALL)

    resolved_content = pattern.sub(r'\2', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(resolved_content)

    print(f"  [OK] Resolved conflicts in {file_path}")
    return True

def scan_and_resolve(directory):
    count = 0
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js', '.py', '.css', '.json', '.html')):
                full_path = os.path.join(root, file)
                if resolve_file_conflict(full_path):
                    count += 1
    return count

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"Scanning for conflict markers in: {base_dir}")
    client_count = scan_and_resolve(os.path.join(base_dir, 'client', 'src'))
    server_count = scan_and_resolve(os.path.join(base_dir, 'server', 'app'))
    print(f"\nDone! Resolved conflicts in {client_count + server_count} files.")
