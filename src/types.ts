export interface RouletteItem {
  id: string;
  name: string;
}

export interface RouletteData {
  id: string;
  title: string;
  items: RouletteItem[];
}
