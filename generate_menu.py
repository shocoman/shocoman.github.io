import os

def generate_htmls_for_links(links):
    newline = '<BR/>\n'
    html = f""" 
        <html>
            <body>
                {newline.join(map(lambda link: f"<a href='{link}'>{link}</a>", links))}
            </body>
        </html>
        """
    return html


def read_links():
    links = []
    for dir in os.listdir(os.getcwd()): 
        
        prefixed_dir = "./" + dir
        if os.path.isdir(prefixed_dir) and not dir.startswith(".") and os.listdir(prefixed_dir).count("index.html"):
            links.append(prefixed_dir)
    return links


def main():
    links = read_links()
    html = generate_htmls_for_links(links)
    with open("index.html", "w") as file:
        file.write(html)

    print("Generated links: ")
    for l in links:
        print("\t", l)

    msg = "minor fix"
    os.system(f"git commit -am {msg}")
    os.system(f"git push")
        

main()