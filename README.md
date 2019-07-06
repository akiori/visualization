## Due to the blocking of GreatF88kWall, use taobao mirror of `npm`
```npm config set registry https://registry.npm.taobao.org```

## Download and Install Node.js
LTS version, at https://nodejs.org/en/

## Download this repo
```git clone https://github.com/akiori/visualization.git```

## Deploy & Run
```javascript
npm install // install dependency packages
npm start // start the project
```

then open Chrome, type in ```http://localhost:3000/VIEW_NAME ``` and hit enter. Pls refer to ```index.js``` .

## Notes

### File Structure
1. `public/data`: data store
2. `views`: html files
3. `index.js`: routers

### Frameworks used
Node.js + Express

### Visualization
D3.js

### Development
add routers in `index.js`, then create new HTML files in `views` folder. All the data are stored in `public/data`.

