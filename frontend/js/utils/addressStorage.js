const ADDRESS_KEY = "campusgo-address-book";

const defaultState = {
    defaultAddress: "",
    extras: [],
};

export function getAddressBook() {
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (!raw) return { ...defaultState };
    try {
        const parsed = JSON.parse(raw);
        return {
            defaultAddress: parsed.defaultAddress || "",
            extras: Array.isArray(parsed.extras) ? parsed.extras : [],
        };
    } catch {
        return { ...defaultState };
    }
}

export function saveAddressBook(addressBook) {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addressBook));
}