import fs from "node:fs"
import { join } from "node:path";
import { Collection } from "./collection";
import { mkdir, stat } from "node:fs/promises";
const NOT_VALID = "provide a valid input";

export class DB {
    private static _rootPath: string = join(__dirname, "../._$$db$$");
    private _collections = new Map<string, InstanceType<typeof Collection>>()
    private _current =  {} as InstanceType<typeof Collection>;
    readonly name: string ;
    constructor(name: string){
        this.name = name;
        // // this._rootPath = rootPath || this._rootPath;
        // let path = DB.getPath();
        // try {
        //     if (!fs.existsSync(path)) {
        //         fs.mkdirSync(path);
        //     }
        // } catch (err) {
        //     throw err;
        // }
    }

    static getPath(name?: string): string {
        return this._rootPath + "/" + (name || this.name);
    }

    static async create(name: string, rootPath?: string) {
        this._rootPath = rootPath || this._rootPath;
        // console.log(this._rootPath)
        // const path = this.getPath();
        try{
            await stat(this._rootPath)
        }catch(err){
            // console.log("Not found: ");
            await mkdir(join(this._rootPath, name), {
                recursive: true
            });
        }
        return new DB(name)
    }

    getName() {
        return this.name;
    }
    
    static use(name: string) {
        let path = this.getPath(name);
        return new DB(name);
    };
    
    async useCollection<T extends {}>(name: string): Promise<Collection<T>> {
        let collection = this._collections.get(name);
        if(!collection) {
            collection = await Collection.create<T>(DB._rootPath, this.name + "." + name);
            this._collections.set(name, collection);
        }
        this._current = collection;
        return collection as Collection<T>;
    };
    
    removeCollection(name: string){
        this._collections.delete(name);
    }

    getCollectionName() {
        //return current collection name;
    };
    
    getCollectionList(){
        // return list of collections
    };

}