import { createStorage } from "../../utils";

export interface SearchInputState {
  searchInput: string;
}

export const searchInputStorage = createStorage<SearchInputState>("search_input", {
  searchInput: ""
});

export function setSearchInput(searchInput: string) {
  searchInputStorage.merge(draft => {
    draft.searchInput = searchInput;
  });
}

export function getSearchInput() {
  return searchInputStorage.get().searchInput;
}
