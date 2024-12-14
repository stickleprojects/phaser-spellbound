
const metadatakey = Symbol();

export class PropertyStats {
    description: string
    datatype: string
    format: string
    getter: () => any;
    setter: (x: any) => void;
    constructor(description: string, datatype: string, format: string, getter: () => any) {
        this.description = description;
        this.datatype = datatype;
        this.format = format;
        this.getter = getter;
    }
}
export function stat(description: string, datatype: string, format: string) {
    return function (target: any, propertyKey: string) {

        let existing = Reflect.getMetadata(metadatakey, target);
        if (!existing) {
            const x = new Map<String, PropertyStats>();

            Reflect.defineMetadata(
                metadatakey,
                x,
                target
            );
        }
        existing = Reflect.getMetadata(metadatakey, target);

        existing.set(propertyKey, new PropertyStats(
            description, datatype, format
            , () => target[propertyKey]
        ));

    }

}
export function GetStats(instance: object): Map<string, PropertyStats> | undefined {
    const metadata = Reflect.getMetadata(metadatakey, instance);

    if (metadata) {
        return metadata;
    }
    return undefined;
}