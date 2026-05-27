import shutil, os

os.makedirs("assets/tool_urbino", exist_ok=True)
shutil.copy("/Users/chiarabacco/Desktop/mappa urbino/mappa_urbino.json", "assets/tool_urbino/")
shutil.copy("/Users/chiarabacco/Desktop/mappa urbino/tool_urbino.html", "assets/tool_urbino/")
print("Copia completata")
