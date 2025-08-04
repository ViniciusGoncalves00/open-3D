import { FileNode } from "../../../common/tree/file-node";
import { FolderNode } from "../../../common/tree/folder-node";
import { TreeNode } from "../../../common/tree/tree-node";

export class Tree {
    private readonly _container: HTMLElement;
    public readonly rootNode: FolderNode;

    public constructor(container: HTMLElement) {
        this._container = container;
        this.rootNode = new FolderNode("assets", null)
    }

    public addChild(child: TreeNode): void {
        this.rootNode.addChild(child);

        if(child.isFolder()) {
            this.addFolder(child as FolderNode);
        }
        else {
            this.addFile(child as FileNode<any>);
        }
    }

    private addFolder(folder: FolderNode): void {
        const row = document.createElement("div");
        row.className = "w-full h-5 flex items-center";
        
        const toggle = document.createElement('button');
        toggle.className = "w-6 flex-none text-center cursor-pointer";
        row.appendChild(toggle);
        
        const toggleIcon = document.createElement('i');
        toggleIcon.className = "bi bi-caret-right-fill transition-transform duration-200";
        toggle.appendChild(toggleIcon);
        
        const title = document.createElement("p");
        title.className = "w-full font-bold";
        title.textContent = folder.name;
        row.appendChild(title);
        
        const folderContainer = document.createElement("div");
        folderContainer.className = "pl-4";
        folderContainer.hidden = true;
        
        for (const child of folder.children) {
            if (child.isFolder()) {
                this.addChildToContainer(child as FolderNode, folderContainer);
            } else {
                this.addChildToContainer(child as FileNode<any>, folderContainer);
            }
        }
    
        toggle.addEventListener('click', () => {
            folderContainer.hidden = !folderContainer.hidden;
            toggleIcon.classList.toggle('bi-caret-right-fill', folderContainer.hidden);
            toggleIcon.classList.toggle('bi-caret-down-fill', !folderContainer.hidden);
        });
    
        this._container.appendChild(row);
        this._container.appendChild(folderContainer);
    }

    private addChildToContainer(child: TreeNode, container: HTMLElement): void {
        if (child.isFolder()) {
            const folder = document.createElement("div");
            const folderTree = new Tree(container);
            folderTree.addFolder(child as FolderNode);
        } else {
            const row = document.createElement("div");
            row.className = "w-full h-5";
            row.textContent = child.name;
            container.appendChild(row);
        }
    }
    
    private addFile(child: FileNode<any>): void {
        const row = document.createElement("div");
        row.className = "w-full h-5";
        row.textContent = child.name;
        this._container.appendChild(row);
    }
}