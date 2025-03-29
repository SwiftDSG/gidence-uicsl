export type Controller = {
  id: string;
  name: string;
  address: {
    host: [number, number, number, number];
    port: number
  }
}