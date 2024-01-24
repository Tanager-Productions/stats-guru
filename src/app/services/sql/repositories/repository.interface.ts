export interface Repository<Type = any, Key = any> {
	find(id: Key): Promise<Type>;
	getAll(): Promise<Type[]>;
	add(model: Type): Promise<Key>;
	delete(id: Key): Promise<void>;
	update(model: Type): Promise<void>;
	bulkAdd(models: Type[]): Promise<void>;
}
