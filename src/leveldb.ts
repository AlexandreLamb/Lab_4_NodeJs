import encoding from 'encoding-down'
import leveldown from 'leveldown'
import levelup from 'levelup'
import del from 'del'
import fs from 'fs'

export class LevelDB {
  static open(path: string) {
    const encoded = encoding(leveldown(path), { valueEncoding: 'json' })
    return levelup(encoded)
  }
  static clear(path: string) {
    if (fs.existsSync(path)) {
      del.sync(path, { force: true })
    }
  }
}