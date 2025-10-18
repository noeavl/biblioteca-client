// Mock data para el panel de administración de autores
// Basado en la estructura de respuesta del backend

interface PanelAuthor {
    _id: string;
    person: {
        _id: string;
        firstName: string;
        lastName: string;
        __v: number;
    };
    books: string[];
    __v: number;
    fileName?: string;
}

export const panelAuthors: PanelAuthor[] = [
    {
        _id: "68f2b1c851fa6c9fdfb6ab0e",
        person: {
            _id: "68f2b1c851fa6c9fdfb6ab0c",
            firstName: "Mary Wollstonecraft",
            lastName: "Shelley",
            __v: 0,
        },
        books: ["68f2b81e46fea9c5a48eec4a"],
        __v: 0,
        fileName: "ef82eb89-6ebb-405b-b627-b4f3ecd4cd53.png",
    },
    {
        _id: "68f3c3a17395c426135553eb",
        person: {
            _id: "68f3c3a17395c426135553e9",
            firstName: "Gabriel Garcia",
            lastName: "Marquez",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3d9d909b5a9a6e747e84f",
        person: {
            _id: "68f3d9d909b5a9a6e747e84d",
            firstName: "Isabel",
            lastName: "Allende",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3da4209b5a9a6e747e859",
        person: {
            _id: "68f3da4209b5a9a6e747e857",
            firstName: "Jorge",
            lastName: "Luis Borges",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3da6e09b5a9a6e747e85f",
        person: {
            _id: "68f3da6e09b5a9a6e747e85d",
            firstName: "Octavio",
            lastName: "Paz",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3da7b09b5a9a6e747e863",
        person: {
            _id: "68f3da7b09b5a9a6e747e861",
            firstName: "Mario",
            lastName: "Vargas Llosa",
            __v: 0,
        },
        books: [],
        __v: 0,
        fileName: "fb393163-6550-49e1-9183-d214208d0b34.png",
    },
    {
        _id: "68f3da8b09b5a9a6e747e867",
        person: {
            _id: "68f3da8b09b5a9a6e747e865",
            firstName: "Julio",
            lastName: "Cortázar",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3da9b09b5a9a6e747e86b",
        person: {
            _id: "68f3da9b09b5a9a6e747e869",
            firstName: "Pablo",
            lastName: "Neruda",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3daab09b5a9a6e747e86f",
        person: {
            _id: "68f3daab09b5a9a6e747e86d",
            firstName: "Carlos",
            lastName: "Fuentes",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3dabb09b5a9a6e747e873",
        person: {
            _id: "68f3dabb09b5a9a6e747e871",
            firstName: "Laura",
            lastName: "Esquivel",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3dacb09b5a9a6e747e877",
        person: {
            _id: "68f3dacb09b5a9a6e747e875",
            firstName: "Miguel",
            lastName: "de Cervantes",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
    {
        _id: "68f3dadb09b5a9a6e747e87b",
        person: {
            _id: "68f3dadb09b5a9a6e747e879",
            firstName: "Federico",
            lastName: "García Lorca",
            __v: 0,
        },
        books: [],
        __v: 0,
    },
];
