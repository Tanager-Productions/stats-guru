export interface Repository<Entity = any, Dto = any, Key = any> {
	find(id: Key): Promise<Dto>;
	getAll(): Promise<Dto[]>;
	add(model: Dto): Promise<void>;
	delete(id: Key): Promise<void>;
	update(model: Dto): Promise<void>;
	bulkAdd(models: Dto[]): Promise<void>;
	mapDbToDto: (entity: Entity) => Dto;
	mapDtoToDb: (entity: Dto) => Entity;
}
