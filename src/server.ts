/**
 * IMPORT AND USE
 */
import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import path = require('path')
import bodyparser = require('body-parser');
import session = require('express-session')
import levelSession = require('level-session-store')
import { UserHandler, User } from './user'

const app = express()
const port: string = process.env.PORT || '8082'

const LevelStore = levelSession(session)




app.use(express.static(path.join(__dirname, '/../public')))

app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');
app.use(session({
  secret: 'Juliette',
  store: new LevelStore('./leveldb'),
  resave: true,
  saveUninitialized: true
}))
/**
 * OTHER ROUTE
 */

app.get('/hello/:name', (req: any, res: any) => {
  res.render('hello.ejs', {name: req.params.name})
})

const dbMet: MetricsHandler = new MetricsHandler('./leveldb/metrics')


/**
 * METRIC ROUTES
 */

app.post('/metrics', (req: any, res: any) => {
  dbMet.saveOne(req.session.user.email+":"+req.body.id, new Metric( Date.now().toString(),req.body.value), (err: Error | null) => {
    if (err) throw err
    res.status(200).redirect('/')
    res.end()
  })
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.getOne(req.session.user.email+":"+req.params.id,(err: Error | null, result :any) => {
    if (err) throw err
    res.status(200).send(result)
  })
})

app.get('/metrics', (req: any, res: any) => {
     dbMet.getAll(req.session.user.email,(err: Error | null, result :any) => {
    if (err) throw err
    res.status(200).send(result)
  })
})

app.delete('/metrics/:id',(req: any, res: any) => {
  dbMet.delete(req.session.user.email+":"+req.params.id,(err: Error | null,result: Boolean) => {
    if (err) throw err
    if(result) {
      res.status(200).send('ok')
    }
    else {
      res.status(200).send('not found the key')
    }
  })
})


 /**
  * AUTH ROUTE
  */
const dbUser: UserHandler = new UserHandler('./leveldb/users')
const authRouter = express.Router()
authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})
authRouter.post('/login', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})
authRouter.post('/signup',(req: any, res: any, next :any)=>{
  dbUser.save(new User(req.body.username, req.body.email, req.body.password),(err:Error| null) =>{
    if (err) {
      next(err)
    }
    res.redirect('/login')
  })
})
/**
 * USER ROUTE
 */
const userRouter = express.Router()

userRouter.post('/', (req: any, res: any, next: any) => {
  dbUser.save(req.body, function (err: Error | null) {
        if (err) next(err)
        else res.status(201).send("user persisted")
      })
})

userRouter.delete('/:username', (req :any , res : any, next: any )=>{
  dbUser.delete(req.body.username,function(err:Error | null){
    if(err) res.status(201).send(err.message)
    else res.status(201).send("result")
  })
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

app.use('/user', userRouter)
app.use(authRouter)

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: req.session.username })
})

 /**
  * LISTEN SERVER
  */
app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`Server is running on http://localhost:${port}`)
})
