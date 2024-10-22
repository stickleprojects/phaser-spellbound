export class TemplateString {
    private _template: string;
    private _params: any[];


    // Custom String.format function
    formatString(template: string, ...args: any[]): string {
        return template.replace(/\${(\d+)}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }

    constructor(template: string, ...params: any[]) {
        this._template = template;
        this._params = params;

    }

    public toString(): string {
        return this.formatString(this._template, this._params);
    }

    public getTemplate() { return this._template; }
    public getParams() { return this._params; }

}
