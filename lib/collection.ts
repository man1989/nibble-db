import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { v4 as uuid } from "uuid";
import {filter, Query} from "./filter";

import * as util from "./util";

const NOT_VALID = "provide a valid input";
type Basetype = {
    _id: string
}

export class Collection<T> {
    private fullName: string;
    private rootPath: string = join(__dirname, "userData");

    constructor(fullName: string, rootPath?: string){
        this.fullName = fullName;
        this.rootPath = rootPath || this.rootPath;
    }

    static async create<CollectionType>(rootPath: string, fullName: string): Promise<Collection<CollectionType>>{
        let path = rootPath + "/" + fullName.split(".").join("/");
        path += ".ldb";
        try{
            await stat(path)
        }catch(err) {
            await writeFile(path, "");
        }
        return new Collection<CollectionType>(fullName, rootPath);
    }

    private getPath() {
        let path = this.rootPath + "/" + this.fullName.split(".").join("/");
        path += ".ldb";
        return path;
    };
    
    async insert(obj: T): Promise<T & Basetype | void> {
        // util.validateInput(obj);
        if(util.isEmptyObject(obj as any)) throw NOT_VALID;
        let uniqueKey = uuid();
        let path = this.getPath();
        obj = Object.assign({
            "_id": uniqueKey
        }, obj);
        try {
            let fileData: string = await readFile(path, "utf-8") || "[]";
            const data: T[]  = JSON.parse(fileData);
            data.push(obj);
            fileData = JSON.stringify(data);
            return writeFile(path, fileData);
        } catch (err) {
            throw err;
        }
    };
    
    async find(query: Partial<T & Basetype>) {
        let path = this.getPath();
        const filtered = filter(query as any);

        let fileData: string = await readFile(path, "utf-8");

        try {
            let results = JSON.parse(fileData) as T[];
            const filteredRes = filtered.test(results, query);
            return filteredRes;
        } catch (err) {}
    };
    
    async update(query: Partial<T & Basetype>, obj: Partial<T>) {
        util.validateInput(query);
        util.validateInput(obj);
        let updates = await this.find(query);
        if(updates && typeof updates !== "object") {
            throw new Error("test");
        }

        (updates as any[]).forEach((row) => {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    row[key] = obj[key];
                }
            }
        });
    
        try {
            let path = this.getPath();
            await stat(path);
            writeFile(path, JSON.stringify(updates));
        } catch (err) {
            throw err;
        }
    };        
}

