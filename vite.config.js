import { resolve } from 'path'
import { defineConfig } from 'vite'

const r = (p) => resolve(__dirname, p)

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: r('index.html'),
        about: r('about.html'),
        work: r('work.html'),
        blog: r('blog.html'),
        contact: r('contact.html'),
        pricing: r('pricing.html'),
        notfound: r('404.html'),
        'work-stellar': r('work/stellar-webovy-dashboard.html'),
        'work-lumiere': r('work/lumiere-mobilni-aplikace.html'),
        'work-echo': r('work/echo-branding-identita.html'),
        'work-nebrio': r('work/nebrio-eshop-platforma.html'),
        'work-vortex': r('work/vortex-sprava-socialnich-siti.html'),
        'work-alcove': r('work/alcove-projektovy-nastroj.html'),
        'work-crescendo': r('work/crescendo-hudebni-streaming.html'),
        'work-nexus': r('work/nexus-cloudove-uloziste.html'),
        'work-quantum': r('work/quantum-virtualni-realita.html'),
        'blog-1': r('blog/navrhovani-se-zamerem.html'),
        'blog-2': r('blog/jasnost-misto-slozitosti.html'),
        'blog-3': r('blog/proc-na-strukture-zalezi.html'),
        'blog-4': r('blog/kreativita-a-pouzitelnost.html'),
        'blog-5': r('blog/socialni-site-pro-rust-znacky.html'),
        'blog-6': r('blog/konzistence-buduje-duveru.html'),
        'blog-7': r('blog/design-systemy.html'),
      },
    },
  },
})
