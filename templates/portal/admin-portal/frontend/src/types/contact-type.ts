export interface ContactType {
    id: string;
    name: string;
}

export interface ContactTypeWithSubtypes {
      id: string;
    name: string;
    parent_id: string | null;
}
export interface ContactTypeParentSubtype {
    parents: ContactTypeWithSubtypes[];
    subtypes: ContactTypeWithSubtypes[];

}
