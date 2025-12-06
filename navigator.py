import os
import re
import time
import blessed
import pyperclip

# --- CONFIGURACIÓN ---
# El nuevo archivo donde se centralizará todo el contenido.
TARGET_FILE = 'contenido_centralizado.js'
# Expresiones regulares para ignorar directorios y archivos comunes
IGNORE_PATTERNS = [
    re.compile(r'node_modules'),
    re.compile(r'\.next'),
    re.compile(r'\.git'),
    re.compile(r'__pycache__'),
    re.compile(r'\.DS_Store'),
]

# --- SCRIPT PRINCIPAL ---
def check_if_ignored(name):
    """Comprueba si un archivo o directorio debe ser ignorado."""
    for pattern in IGNORE_PATTERNS:
        if pattern.search(name):
            return True
    return False

def centralize_file_content(path_to_copy, project_root, status_message_func):
    """
    Gestiona la copia del CONTENIDO de un archivo: lo lee, lo valida
    contra TARGET_FILE y lo añade al archivo y al portapapeles.
    """
    # 1. Crear ruta relativa para usarla en los comentarios de cabecera
    relative_path = os.path.relpath(path_to_copy, project_root)
    relative_path = relative_path.replace(os.path.sep, '/')
    
    # 2. Validar si el bloque de contenido ya existe en el archivo destino
    try:
        # Crea el archivo si no existe
        if not os.path.exists(TARGET_FILE):
            with open(TARGET_FILE, 'w', encoding='utf-8') as f:
                f.write('// Archivo centralizado de contenido de módulos\n\n')

        with open(TARGET_FILE, 'r', encoding='utf-8') as f:
            content_in_target = f.read()
            # Busca la cabecera del bloque para evitar duplicados
            header_comment = f"// --- Contenido de: {relative_path} ---"
            if header_comment in content_in_target:
                status_message_func(f"⚠️ Ya existe el contenido de: {os.path.basename(relative_path)}", 3)
                return
    except IOError as e:
        status_message_func(f"❌ Error al leer {TARGET_FILE}: {e}", 5)
        return

    # 3. Leer el contenido del archivo fuente y copiarlo
    try:
        with open(path_to_copy, 'r', encoding='utf-8') as f:
            file_content = f.read()

        # Formatear el bloque que se va a añadir
        formatted_block = (
            f"// --- Contenido de: {relative_path} ---\n"
            f"{file_content}\n"
            f"// --- Fin de: {relative_path} ---\n\n\n"
        )
        
        pyperclip.copy(file_content) # Copia el contenido puro al portapapeles
        
        with open(TARGET_FILE, 'a', encoding='utf-8') as f:
            f.write(formatted_block)
            
        status_message_func(f"✅ Contenido copiado de: {os.path.basename(relative_path)}", 3)
        
    except pyperclip.PyperclipException:
        status_message_func("❌ Error: Instala pyperclip (pip install pyperclip)", 5)
    except IOError as e:
        status_message_func(f"❌ Error al leer {os.path.basename(relative_path)}: {e}", 5)


def main():
    """Función principal que ejecuta la interfaz interactiva."""
    term = blessed.Terminal()
    project_root = os.getcwd()
    current_path = project_root
    selected_index = 0
    status_message = ""
    status_duration = 0
    last_key_press_time = 0
    
    with term.cbreak(), term.hidden_cursor(), term.fullscreen():
        while True:
            # --- RENDERIZADO DE LA UI ---
            print(term.clear)
            
            # Header
            header = f" Explorando: {os.path.relpath(current_path, project_root) or '.'} "
            print(term.bold_black_on_white(header.center(term.width)))

            # Listado de archivos y directorios
            try:
                items = sorted([item for item in os.listdir(current_path) if not check_if_ignored(item)])
            except OSError as e:
                status_message = f"❌ Error: {e}"
                status_duration = 5
                items = []

            # Paginación simple
            start_index = max(0, selected_index - term.height // 2)
            end_index = start_index + term.height - 4

            for i, item_name in enumerate(items[start_index:end_index]):
                full_item_path = os.path.join(current_path, item_name)
                display_line = ""
                
                if os.path.isdir(full_item_path):
                    display_line = term.blue(f"📁 {item_name}/")
                else:
                    display_line = term.green(f"📄 {item_name}")

                if i + start_index == selected_index:
                    print(term.reverse(display_line.ljust(term.width)))
                else:
                    print(display_line)
            
            # Footer y mensajes
            if status_duration > 0:
                print(term.move_y(term.height - 2) + term.on_gray(status_message.ljust(term.width)))
                status_duration -= 1
            else:
                footer = "←: Dir. Padre | ↑/↓: Mover | ↵: Entrar/Copiar Contenido | Espacio x2: Copiar Todo | Q: Salir"
                print(term.move_y(term.height - 2) + term.black_on_cyan(footer.ljust(term.width)))

            # --- MANEJO DE ENTRADA ---
            key = term.inkey(timeout=1)

            def set_status(msg, duration):
                nonlocal status_message, status_duration
                status_message = msg
                status_duration = duration

            if not key:
                continue

            if key.lower() == 'q':
                break
            
            elif key.code == term.KEY_UP:
                selected_index = max(0, selected_index - 1)
            elif key.code == term.KEY_DOWN:
                if items:
                    selected_index = min(len(items) - 1, selected_index + 1)
            elif key.code == term.KEY_LEFT:
                parent_dir = os.path.dirname(current_path)
                if parent_dir != current_path:
                    current_path = parent_dir
                    selected_index = 0
                    set_status(f"⏪ Directorio padre", 2)
            
            elif key.code == term.KEY_ENTER:
                if not items: continue
                selected_item_name = items[selected_index]
                full_path = os.path.join(current_path, selected_item_name)
                if os.path.isdir(full_path):
                    current_path = full_path
                    selected_index = 0
                else:
                    centralize_file_content(full_path, project_root, set_status)

            elif key == ' ':
                current_time = time.time()
                if current_time - last_key_press_time < 0.4:
                    files_in_dir = [os.path.join(current_path, f) for f in items if os.path.isfile(os.path.join(current_path, f))]
                    if not files_in_dir:
                        set_status("ℹ️ No hay archivos para copiar en este directorio.", 3)
                    else:
                        copied_count = 0
                        for f_path in files_in_dir:
                            # Usamos una función lambda para manejar el estado de forma silenciosa en el bucle
                            def silent_copier(msg, dur):
                                nonlocal copied_count
                                if "✅" in msg:
                                    copied_count += 1
                            centralize_file_content(f_path, project_root, silent_copier)
                        set_status(f"✅ Copiados los contenidos de {copied_count} archivo(s).", 3)
                    last_key_press_time = 0 # Reset para evitar triple pulsación
                else:
                    last_key_press_time = current_time


if __name__ == "__main__":
    try:
        import blessed
        import pyperclip
    except ImportError:
        print("Error: Faltan dependencias. Por favor, instálalas con:")
        print("pip install blessed pyperclip")
        exit(1)
        
    main()
