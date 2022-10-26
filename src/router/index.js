import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "redirect",
    component: () =>
      import("../views/Home.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import("../views/Login.vue"),
  },
  {
    path: "/notes",
    name: "NotesPage",
    component: () =>
      import("../views/NotesPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
