import { defineConfig } from "drizzle-kit";
 
export default defineConfig({
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./k.sqlite',
  }
});