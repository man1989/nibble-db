type Basetype = {
    _id: string;
};
declare class Collection<T> {
    private fullName;
    private rootPath;
    constructor(fullName: string, rootPath?: string);
    static create<CollectionType>(rootPath: string, fullName: string): Promise<Collection<CollectionType>>;
    private getPath;
    insert(obj: T): Promise<T & Basetype | void>;
    find(query: Partial<T & Basetype>): Promise<boolean | any[] | undefined>;
    update(query: Partial<T & Basetype>, obj: Partial<T>): Promise<void>;
    delete(query: any): Promise<void>;
}

declare class DB {
    private static _rootPath;
    private _collections;
    private _current;
    readonly name: string;
    constructor(name: string);
    static getPath(name?: string): string;
    static create(name: string, rootPath?: string): Promise<DB>;
    getName(): string;
    static use(name: string): DB;
    useCollection<T extends {}>(name: string): Promise<Collection<T>>;
    removeCollection(name: string): void;
    getCollectionName(): void;
    getCollectionList(): void;
}

export { DB };
