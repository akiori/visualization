## Learn to use Git first
besides I suggest everyone use [`Visual Studio Code`](https://code.visualstudio.com/) as code editor. It's the most powerful editor (currently).
for windows users, I also suggest you to use [`cmder`](https://cmder.net/) as the command line tool. it looks better and works better than Windows' own command line tool.

## Download and Install Node.js
LTS version, at https://nodejs.org/en/

## Due to the blocking of GreatF88kWall, use taobao mirror of `npm`
```npm config set registry https://registry.npm.taobao.org```

## Download this repo
```git clone https://github.com/akiori/visualization.git```

## Deploy & Run
**please run these commands inside the root folder of `visualization`!**
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

