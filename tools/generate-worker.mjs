import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const root = new URL('../dist/', import.meta.url)
const serverDir = new URL('../dist/server/', import.meta.url)
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'}
const files = {}
async function walk(dir) {
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const path=join(dir,entry.name)
    if(entry.isDirectory()&&entry.name!=='server') await walk(path)
    else if(entry.isFile()&&!path.includes('/.openai/')) {
      const key='/'+relative(root.pathname,path)
      files[key]={type:mime[extname(path)]||'application/octet-stream',data:(await readFile(path)).toString('base64')}
    }
  }
}
await walk(root.pathname)
await mkdir(serverDir,{recursive:true})
const source=`const FILES=${JSON.stringify(files)};\nfunction decode(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}\nexport default{async fetch(request){const u=new URL(request.url);let key=u.pathname==='/'?'/index.html':u.pathname;const f=FILES[key]||FILES['/index.html'];return new Response(decode(f.data),{status:FILES[key]?200:404,headers:{'content-type':f.type,'cache-control':key==='/index.html'?'no-cache':'public, max-age=31536000, immutable','x-content-type-options':'nosniff'}})}}`
await writeFile(new URL('index.js',serverDir),source)
