import type { AsyncDuckDB, DuckDBBundles } from '@duckdb/duckdb-wasm'
// ?url só gera o endereço do arquivo; .wasm e worker são baixados no instantiate()
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'
import { dataUrl } from '../utils/dataUrl'

const BUNDLES: DuckDBBundles = {
  mvp: { mainModule: mvpWasm, mainWorker: mvpWorker },
  eh: { mainModule: ehWasm, mainWorker: ehWorker },
}

// o módulo do duckdb (js + apache-arrow) entra por import dinâmico: vira um chunk
// separado, baixado só na primeira consulta — isto é, quando um mapa abre
const loadDuckDB = () => import('@duckdb/duckdb-wasm')

let dbPromise: Promise<AsyncDuckDB> | null = null
const registeredFiles = new Map<string, Promise<void>>()

async function instantiate(): Promise<AsyncDuckDB> {
  const duckdb = await loadDuckDB()
  const bundle = await duckdb.selectBundle(BUNDLES)
  const worker = new Worker(bundle.mainWorker!)
  const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker)
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
  return db
}

function getDb(): Promise<AsyncDuckDB> {
  dbPromise ??= instantiate()
  return dbPromise
}

// registra o parquet por http: o duckdb lê só os row groups/colunas necessários (range requests)
async function registerFile(db: AsyncDuckDB, file: string): Promise<void> {
  if (!registeredFiles.has(file)) {
    const { DuckDBDataProtocol } = await loadDuckDB()
    registeredFiles.set(file, db.registerFileURL(file, dataUrl(file), DuckDBDataProtocol.HTTP, false))
  }
  return registeredFiles.get(file)!
}

/**
 * executa sql sobre arquivos de public/data. os arquivos citados no sql
 * (read_parquet('<arquivo>')) precisam estar em `files`.
 */
export async function query<T>(sql: string, files: string[], params: unknown[] = []): Promise<T[]> {
  const db = await getDb()
  await Promise.all(files.map((file) => registerFile(db, file)))
  const conn = await db.connect()
  try {
    const stmt = await conn.prepare(sql)
    const table = await stmt.query(...params)
    await stmt.close()
    return table.toArray().map((row) => row.toJSON() as T)
  } finally {
    await conn.close()
  }
}
