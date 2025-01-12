(async function main() {
  let en2ch = await getExplanation();

  let lang = "ch";

  var margin = {top: 10, bottom: 80, left: 150, right: 30};
  var svgWidth = 1170;
  var svgHeight = 740;
  // var svgHeight = 550;

  var width=svgWidth - margin.left - margin.right;
  var height=svgHeight - margin.top - margin.bottom;

  var svg = d3.select('.container')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
  // scale
  var y = d3.scaleLinear()
            .domain([2000, 4000, 8000, 10000, 20000, 40000, 80000, 100000, 200000, 300000, 400000])
            // .domain([1000, 2000, 4000, 8000, 10000, 20000, 40000, 80000, 100000, 200000, 300000, 400000])
            // .domain([0, 100, 250, 500, 1000, 4000, 7000, 10000, 50000, 100000, 380000, 400000])
            .range([height,(height-30)*9/10+30,(height-30)*8/10+30,(height-30)*7/10+30,(height-30)*6/10+30,(height-30)*5/10+30,(height-30)*4/10+30,(height-30)*3/10+30,(height-30)*2/10+30,(height-30)/10+30, 30,0]);

  var x = d3.scaleLinear()
            // .domain([0, 10, 50, 75, 100, 600, 1200, 2400])
            // .domain([60, 200, 400, 800, 1600, 2000, 2400, 2900])
            .domain([50, 200, 400, 800, 1200, 1600, 2000, 2900])
            .range([0,(width-30)/7,(width-30)*2/7,(width-30)*3/7,(width-30)*4/7,(width-30)*5/7,(width-30)*6/7,width-30,width])

  var r = d3.scaleLinear()
            // .domain([0, 0.365010869, (0.365010869 + 2 / 3) / 2, 2 / 3, 1])
            .domain([0, 0.401394874683146, 0.50448195659342, 0.592832046557058, 1])
            // .range([25, 7, 25, 7, 25]);
            .range([25, 15, 15, 15, 25]);
  var color = d3.scaleQuantile()
                // .domain([0, 0.365010869, (0.365010869 + 2 / 3) / 2, 2 / 3, 1])
                .domain([0, 0.401394874683146, 0.50448195659342, 0.592832046557058, 1])
                .range(["#1B6AA5", "#748C9D", "#9D7A7F", "#E8110F" ]);

  // axises
  var xAxis = d3.axisBottom(x)
                .tickSize(-height)
                .tickValues([50, 200, 400, 800, 1200, 1600, 2000, 2900]);
                // .tickValues([60, 200, 400, 800, 1600, 2000, 2400, 2900]);
                // .tickValues([0, 10, 50, 75, 100, 600, 1200, 2400]);

  var yAxis = d3.axisLeft(y)
                .tickSize(-width)
                .tickValues([2000, 8000, 20000, 80000, 200000, 400000]);
                // .tickValues([0, 250, 1000, 7000, 50000, 380000])

  let buttonSize = 40;
  let buttonPlay = true;
  let videoYOffset = 30;
  let buttonXOffset = -15;
  let button = svg.append("image")
    .attr("class", "video-button")                              
    .attr('width', buttonSize)                     
    .attr('height', buttonSize)  
    .attr("xlink:href", d => `public/data/bubble/${buttonPlay ? 'play' : 'pause'}.svg`)
    .attr("transform", `translate(${margin.left - buttonSize + buttonXOffset},${margin.top + height + videoYOffset})`);

  let sliderHeight = 10;
  let borderRadius = 5;
  let slider = svg.append("rect")
    .attr("class", "video-slider")
    .attr("x", margin.left)
    .attr("y", margin.top + height + videoYOffset + buttonSize / 2 - sliderHeight / 2)
    .attr("width", width)
    .attr("height", sliderHeight)
    .attr("rx", borderRadius)
    .attr("ry", borderRadius);

  let anchorRadius = 10;
  let anchor = svg.append("circle")
    .attr("class", "video-anchor")
    .attr("cx", margin.left)
    .attr("cy", margin.top + height + videoYOffset + buttonSize / 2)
    .attr("r", anchorRadius);

  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top+height})`)
    .call(xAxis)
    .attr('class','axis')
    .selectAll("text")
    .attr('dy',16)
    .style("text-anchor", "middle");
  svg.append("text")             
      .attr("transform",
            "translate(" + (width-140) + " ," + 
                          (height + margin.top-10) + ")")
      .style("text-anchor", "start")
      .text(lang === "en" ? "Tweet" : "新推特量")
      .attr('class','xLabel');
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .attr('class','axis')
    .call(yAxis);
  svg.append('g')
      .attr("transform",`translate(${margin.left+42},${margin.top+8})`)
      .append("text")             
      .attr("transform",
            "rotate(270)")
      .style("text-anchor", "end")
      .text(lang === "en" ? "Retweet" : "转发量")
      .attr('class','xLabel');

  var bisect = d3.bisector(function(d) { return d[0]; });
  
  function parseDate(str){
    var y = str.substr(0,4),
        m = str.substr(4,2)-1,
        d = str.substr(6,2);
    if(d) return new Date(y,m,d);
    return new Date(y,m,1);
  }
  function getDataByMonth(data,time){
    return data.map(d=>{
      return {
        label: d.label,
        forward: findFreqByMonth(d.value,time),
        freq: findForwardByMonth(d.value,time),
        time: time,
        trend: d.trend
      }
    })
  }
  function findFreqByMonth(data,time){
    let index = bisect.left(data,time);
    let now = data[index];
    if (index > 0) {
      let last = data[index-1];
      let timeScale = d3.scaleLinear()
            .domain([last[0], now[0]])
            .range([last[1],now[1]]);
      return timeScale(time);
    }
    return now[1];

    // let index = bisect.left(data,time);
    // let now = data[index];
    // if (index > 0) {
    //   let last = data[index-1];
    //   let timeScale = d3.scaleLinear()
    //         .domain([last[0], now[0]])
    //         .range([x(last[1]),x(now[1])]);
    //   return x.invert(timeScale(time));
    // }
    // return now[1];
  }
  function findForwardByMonth(data,time){
    let index = bisect.left(data,time);
    let now = data[index];
    if (index > 0) {
      let last = data[index-1];
      let timeScale = d3.scaleLinear()
            .domain([last[0], now[0]])
            .range([last[2],now[2]]);
      return timeScale(time);
    }
    return now[2];

    // let index = bisect.left(data,time);
    // let now = data[index];
    // if (index > 0) {
    //   let last = data[index-1];
    //   let timeScale = d3.scaleLinear()
    //         .domain([last[0], now[0]])
    //         .range([y(last[2]),y(now[2])]);
    //   return y.invert(timeScale(time));
    // }
    // return now[2];
  }

  var dataArray=[];
  d3.csv('public/data/hashtag_bubble_deleted0414.csv').then(function(data) {

    data.forEach(d => {
      let tmp={};
      tmp.label=d.hashtag.trim();
      tmp.trend=d.trend.trim();
      tmp.value=[];
      for(let label in d){
        if(label!=='hashtag'&&label!=='trend'&&label.substr(0,2)!=='re'){
          tmp.value.push([parseDate(label),parseInt(d[label]),parseInt(d['re'+label])]);
        }
      }
      tmp.value.sort((a,b)=> a[0]-b[0]);
      dataArray.push(tmp);
    });


    let labelSet = dataArray.map(d => d.label.slice(1)).sort();
    let twitterEnglish = getTwitterEnglish();
    let twitterChinese = getTwitterChinese();
    let twitterText = lang === "ch" ? twitterChinese : twitterEnglish;
    createHeaderPanel();
    createAsidePanel(labelSet);
    createDownsidePanel(labelSet);

    var monthText = svg.append('g')
                  .append('text')
                  .attr('x',margin.left+60)
                  .attr('y',margin.top+160)
                  .attr('class','monthText');
    // Add a dot per state. Initialize the data at 1950, and set the colors.
    let startDate = new Date(2016, 0);
    let limitDate = new Date(2019, 2, 31, 23, 59, 59);
    let endDate = new Date(2019, 3);
    let dataset = getDataByMonth(dataArray, startDate);

    let clipPath = svg.append("clipPath")
      .attr("id", "chart-area")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("height", height)
      .attr("width", width);
    let svgChart = svg.append("g")
      .attr("id", "chart")
      .attr("clip-path", "url(#chart-area)");

    let showupText = svgChart.append("g")
      .selectAll(".showupText")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "showupText")
      .attr("data-label", d => d.label.slice(1))
      .text(d => twitterText[d.label.slice(1)])
      .style("fill-opacity", 0);

    var dot = svgChart.append("g")
          .attr("class", "dots")
          .selectAll(".dot")
          .data(dataset)
          .enter().append("circle")
          .attr("class", "dot")
          .attr("data-label", d => d.label.slice(1));

    let cursorLines = svgChart.append("g")
      .attr("class", "cursor")
    let horizontalCursor = cursorLines.selectAll(".horizontal")
      .data(dataset)
      .enter()
      .append("line")
      .attr("class", "horizontal")
      .attr("data-label", d => d.label.slice(1))
      .attr("stroke-opacity", 0);
    let verticalCursor = cursorLines.selectAll(".vertical")
      .data(dataset)
      .enter()
      .append("line")
      .attr("class", "vertical")
      .attr("data-label", d => d.label.slice(1))
      .attr("stroke-opacity", 0);
    
    let cursorText = svg.append("g")
      .attr("class", "cursor-text")
    let horizontalText = cursorText.selectAll(".horizontal")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "horizontal")
      .attr("data-label", d => d.label.slice(1))
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "baseline")
      .style("fill-opacity", 0);
    let verticalText = cursorText.selectAll(".vertical")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "vertical")
      .attr("data-label", d => d.label.slice(1))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging")
      .style("fill-opacity", 0);

    var text = svgChart.append("g")
      .selectAll(".text")
      .data(dataset)
      .enter().append("text")
      .attr("class", "textLabel")
      .attr("x", function(d) {
        return d.x;
      }).attr("y", function(d) {
        return d.y;
      })
      .attr("data-label", d => d.label.slice(1))
      .text("")
      .style("text-anchor", "middle")
      .style("fill", function(d) { return "#242424"; })
      .style("display",function(d) {
        if(!isVisible(d)){
        return 'none';}});

    let textDateLabel = svgChart.append("g")
      .selectAll(".text")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "textDateLabel")
      .attr("id", d => `textDateLabel-${d.label.slice(1)}`)
      .style("display", "none");

    let mouseoverDot = null;
    let isKeyUp = true;
    let isAnimationFinished = false;
    let timeline = generateTimeline(dataArray);

    // let pastTimeline = initSelectionTimeline(labelSet);
    let pastCircle = initSelectionPastCircle(labelSet);
    let pastLine = initSelectionPastLine(labelSet);

    // pre-calculate path of all hashtag
    preCalcSelectionPast(labelSet, timeline);

    let timer = svg.append("svg:text")
      .attr("T", 0)
      .text("");
    const totalTime = 120000;
    const durationTime = 500;
    let easeFunc = d3.easeLinear;

    const dateScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, totalTime]);
    const anchorScale = d3.scaleLinear()
      .domain([0, width])
      .range([0, totalTime]);

    let { lifeCycle, lifeCycleGradient } = calcLifeCycle(labelSet);
    let showupLifeCycle = calcShowup(lifeCycle);
    renderDownsideWithLifeCycle(lifeCycleGradient);

    initTime();
    startTime(easeFunc, totalTime, totalTime, dateScale);
    disableCursor();

    let checkboxs = d3.selectAll("div.labelRow input");
    let checkAll = d3.select("input#input-all");

    checkboxs.on("change", checkedHandler);
    checkAll.on("change", checkedAllHandler);
    button.on("click", buttonClickedHandler);
    slider.on("click", sliderClickedHandler);
    anchor.call(d3.drag()
      .on("start", dragStartedHandler)
      .on("drag", draggedHandler)
      .on("end", dragendedHandler));
    text.on("mouseover", mouseOverHandler);
    text.on("mouseout", mouseOutHandler);
    // showupText.on("mouseover", mouseOverHandler);
    // showupText.on("mouseout", mouseOutHandler);
    dot.on("mouseover", mouseOverHandler);
    dot.on("mouseout", mouseOutHandler);
    document.onkeydown = keyDownHandler;
    document.onkeyup = keyUpHandler;

    function calcLifeCycle(labelSet) {
      let tweenValue = getTweenValue();
      let dateInterpolator = d3.interpolateDate(startDate, endDate);
      let formatter = d3.timeFormat("%Y-%m-%d-%H-%M-%S");
      let parser = d3.timeParse("%Y-%m-%d-%H-%M-%S");
      let dateArray = tweenValue.map(t => formatter(dateInterpolator(t)));
      let dataset = dateArray.map(date => getDataByMonth(dataArray, parser(date)));

      let lifeCycle = {};
      labelSet.forEach((label, i) => lifeCycle[label] = calcLifeCycleByLabel(dataset.map(data => data[i])));

      let lifeCycleGradient = transformLifeCycleToGradient(lifeCycle);

      return {
        lifeCycle, 
        lifeCycleGradient,
      };
    }

    function calcShowup(lifeCycle) {
      let showupLifeCycle = {};

      Object.keys(lifeCycle).forEach(key => {
        showupLifeCycle[key] = lifeCycle[key].filter(d => d[1] === true);
      });

      return showupLifeCycle;
    }

    function calcLifeCycleByLabel(data) {
      let result = [];

      let visible = isVisible(data[0]);
      result.push([data[0].time, visible]);
      for (let i = 1, len = data.length; i < len; i += 1) {
        if (isVisible(data[i]) !== visible) {
          visible = !visible;
          result.push([data[i].time, visible]);
        }
      }

      return result;
    }

    function isVisible(dataItem) {
      return dataItem.freq >= 2000 || dataItem.forward >= 50;
    }

    function transformLifeCycleToGradient(lifeCycle) {
      let labels = Object.keys(lifeCycle);

      let gradient = {};
      labels.forEach(label => {
        lifeCycleOfLabel = lifeCycle[label];
        gradient[label] = [];
        gradient[label].push("to right");

        for (let i = 1, len = lifeCycleOfLabel.length; i < len; i += 1) {
          gradient[label].push(`${lifeCycleOfLabel[i][1] ? 'white' : '#909099'} ${dateScale(lifeCycleOfLabel[i][0]) / totalTime * 100}%`);
          gradient[label].push(`${lifeCycleOfLabel[i][1] ? '#909099' : 'white'} ${dateScale(lifeCycleOfLabel[i][0]) / totalTime * 100}%`);
        }

        gradient[label] = gradient[label].join(",")
      });

      return gradient;
    }

    function renderDownsideWithLifeCycle(lifeCycleGradient) {
      let labels = Object.keys(lifeCycleGradient);

      labels.forEach(label => {
        d3.select(".downside")
          .select(`#lifeCycleItem-bar-${label}`)
          .style("background", `linear-gradient(${lifeCycleGradient[label]})`)
      });
    }

    function position(dot) {
      dot.attr('cx',d=>x(d.forward + 1)+margin.left)
        .attr('cy',d=>y(d.freq + 1)+margin.top)
        .attr('r',d => {
          if (!isVisible(d)) {
            return 2;
          } else {
            return r(d.trend);
          }
        })
        .style("fill", function(d) { return color(d.trend); })
        .style("stroke",function(d) { return color(d.trend); })
        .style("display", function(d) {
          let selectedLabel = getSelectedLabel();
          if ((!isVisible(d)) && selectedLabel.findIndex(label => label === d.label.slice(1)) === -1) {
            return "none";
          }
        });
    }

    function textDateLabelPosition(textDateLabel) {
      textDateLabel
        .attr("transform", d => `translate(${x(d.forward + 1) + margin.left}, ${(() => {
          let radius = (!isVisible(d)) ? 2 : r(d.trend);
          return y(d.freq + 1)+margin.top - radius;
        })()})`)
        .text(d => {
          let time;
          if (d.time <= limitDate) {
            time = d3.timeFormat("%Y.%m")(d.time);
          } else {
            time = d3.timeFormat("%Y.%m")(limitDate);
          }

          return time;
        });
    }

    function horCursorPosition(line) {
      line.attr("x1", margin.left)
        .attr("y1", d => y(d.freq + 1) + margin.top)
        .attr("x2", d => x(d.forward + 1) + margin.left - r(d.trend))
        .attr("y2", d => y(d.freq + 1) + margin.top)
    }

    function verCursorPosition(line) {
      line.attr("x1", d => x(d.forward + 1) + margin.left)
        .attr("y1", d => y(d.freq + 1) + margin.top + r(d.trend))
        .attr("x2", d => x(d.forward + 1) + margin.left)
        .attr("y2", y.range()[0] + margin.top)
    }

    function horTextPosition(text) {
      text.attr("transform", d => `translate(${margin.left}, ${y(d.freq + 1) + margin.top})`)
        .text(d => parseInt(d.freq) + 1);
    }

    function verTextPosition(text) {
      text.attr("transform", d => `translate(${x(d.forward + 1) + margin.left}, ${y.range()[0] + margin.top})`)
        .text(d => parseInt(d.forward) + 1);
    }

    function checkedHandler() {
      let selectedLabel = getSelectedLabel();
      let currentTime = getTime();
      let currentDate = dateScale.invert(currentTime);

      updateMask(selectedLabel);
      updatePast(d3.select(this), currentDate);
      
      let checkbox = d3.select(this);
      let label = checkbox.attr("name");
      if (checkbox.property("checked")) {
        d3.select(`#lifeCycleRow-${label}`)
          .style("display", "block");

        d3.select(".header")
          .style("border-color", "#909099")
          .html(`${twitterChinese[label]}(#${twitterEnglish[label]}): ${en2ch[label]}`);

        if (selectedLabel.length === labelSet.length) {
          d3.select("input#input-all")
            .property("checked", true);
        }
      } else {
        d3.select(`#lifeCycleRow-${label}`)
          .style("display", "none");
      }
    }

    function checkedAllHandler() {
      let checkbox = d3.select("#input-all");

      if (checkbox.property("checked")) {
        d3.selectAll("div.labelRow input")
          .property("checked", true);

        d3.selectAll("div.lifeCycleRow")
          .style("display", "block");
      } else {
        d3.selectAll("div.labelRow input")
          .property("checked", false);
        
        d3.selectAll("div.lifeCycleRow")
          .style("display", "none");
      }

      let currentTime = getTime();
      let currentDate = dateScale.invert(currentTime);
      let selectedLabel = getSelectedLabel();
      updateMask(selectedLabel);
      labelSet.forEach(label => updatePast(d3.select(`#input-${label}`), currentDate));
    }

    function buttonClickedHandler() {
      buttonPlay = !buttonPlay;
      button.attr("xlink:href", d => `public/data/bubble/${buttonPlay ? 'play' : 'pause'}.svg`);
      if (!buttonPlay) {
        stopTime();
        enableCursor();
      } else {
        if (isAnimationFinished) {
          resetTime();
          startTime(easeFunc, totalTime, totalTime, dateScale);
          disableCursor();
          isAnimationFinished = false;
        } else {
          let timeTodo = totalTime - getTime();
          startTime(easeFunc, totalTime, timeTodo, dateScale);
          disableCursor();
        }
      }
    }

    function keyDownHandler(event) {
      if (event.keyCode === 32) {
        event.preventDefault();
        if (isKeyUp) {
          isKeyUp = false;
          buttonClickedHandler();
        }
      }
    }

    function keyUpHandler(event) {
      if (event.keyCode === 32) {
        event.preventDefault();
        isKeyUp = true;
      }
    }

    function sliderClickedHandler(event) {
      // if (buttonPlay) {
      //   buttonPlay = false;
      //   button.attr("xlink:href", `public/data/bubble/pause.svg`);
      //   stopTime();
      //   return;
      // }
      let hyperParam = 0;
      stopTime();

      let offset = parseFloat(d3.select(".video-slider").attr("x"));
      let minCXPos = offset + anchorScale.domain()[0];
      let maxCXPos = offset + anchorScale.domain()[1];
      let currentCXPos = Math.max(minCXPos, d3.event.x + hyperParam);
      currentCXPos = Math.min(maxCXPos, currentCXPos);

      let anchor = d3.select(".video-anchor");
      anchor.attr("cx", currentCXPos);

      let currentTime = anchorScale(currentCXPos - offset);
      setTime(currentTime);

      startTime(easeFunc, totalTime, totalTime - currentTime, dateScale);
      buttonPlay = true;
      button.attr("xlink:href", `public/data/bubble/play.svg`);
    }

    function dragStartedHandler() {
      button.on("click", null);

      buttonPlay = false;
      button.attr("xlink:href", `public/data/bubble/pause.svg`);
      stopTime();
    }

    function draggedHandler() {
      let offset = parseFloat(d3.select(".video-slider").attr("x"));
      let minCXPos = offset + anchorScale.domain()[0];
      let maxCXPos = offset + anchorScale.domain()[1];
      let currentCXPos = Math.max(minCXPos, d3.event.x);
      currentCXPos = Math.min(maxCXPos, currentCXPos);

      d3.select(this)
        .attr("cx", currentCXPos);

      let currentTime = anchorScale(currentCXPos - offset);
      setTime(currentTime);
    }

    function dragendedHandler() {
      let currentTime = getTime();

      buttonPlay = true;
      button.attr("xlink:href", `public/data/bubble/play.svg`);
      let timeTodo = totalTime - currentTime;
      startTime(easeFunc, totalTime, timeTodo, dateScale);

      button.on("click", buttonClickedHandler);
    }

    function mouseOverHandler() {
      let label = d3.select(this).attr("data-label");
      let selectedLabel = getSelectedLabel();

      mouseoverDot = label;

      d3.select(`#textDateLabel-${label}`).style("display", "block");

      updateMask(selectedLabel);

      if (selectedLabel.length === 0) {
        d3.select(".header")
          .style("border-color", "#909099")
          .html(`${twitterChinese[label]}(#${twitterEnglish[label]}): ${en2ch[label]}`);
      }

      if (!buttonPlay) {
        d3.selectAll(".cursor")
          .selectAll(`line[data-label = ${label}]`)
          .attr("stroke-opacity", 1);

        d3.selectAll(".cursor-text")
          .selectAll(`text[data-label = ${label}]`)
          .style("fill-opacity", 1);

        d3.selectAll("g.axis")
          .selectAll("g.tick")
          .selectAll("text")
          .style("display", "none");
      }
    }

    function mouseOutHandler() {
      let label = d3.select(this).attr("data-label");

      d3.select(`#textDateLabel-${label}`).style("display", "none");

      mouseoverDot = null;

      let selectedLabel = getSelectedLabel();
      updateMask(selectedLabel);

      if (!buttonPlay) {
        d3.selectAll(".cursor")
          .selectAll(`line[data-label = ${label}]`)
          .attr("stroke-opacity", 0);

        d3.selectAll(".cursor-text")
          .selectAll(`text[data-label = ${label}]`)
          .style("fill-opacity", 0);

        d3.selectAll("g.axis")
          .selectAll("g.tick")
          .selectAll("text")
          .style("display", "block");
      }
    }

    function initTime(totalTime, easeFunc) {
      resetTime();
    }

    function resetTime() {
      timer.attr("T", 0);
    }

    function startTime(ease, totalTime, timeTodo, dateScale) {
      timer.transition()
        .duration(timeTodo)
        .ease(easeFunc)
        .attr("T", totalTime);

      svg.transition()
        .duration(timeTodo)
        .ease(easeFunc)
        .tween('time', () => {
          return function(t) {
            var month = d3.interpolateDate(dateScale.invert(totalTime - timeTodo), endDate);
            tweenYear(month(t));
          }
        });
    }

    function stopTime() {
      // timer.transition()
      //   .duration(0);
      // svg.transition()
      //   .duration(0);
      timer.interrupt();
      svg.interrupt();
    }

    function getTime() {
      return timer.attr("T");
    }

    function setTime(currentTime) {
      timer.attr("T", currentTime);
    }

    function tweenYear(year) {
      let dataset = getDataByMonth(dataArray,year);

      dot.data(dataset).call(position);
      textDateLabel.data(dataset).call(textDateLabelPosition);
      
      updateShowupText(year, dataset, showupText, showupLifeCycle);

      updateTraj(year);

      horizontalCursor.data(dataset).call(horCursorPosition);
      verticalCursor.data(dataset).call(verCursorPosition);
      horizontalText.data(dataset).call(horTextPosition);
      verticalText.data(dataset).call(verTextPosition);
      textPosition(dataset);

      if (year <= limitDate) {
        monthText.text(year.getFullYear()+'/'+(year.getMonth()+1));
      } else {
        isAnimationFinished = true;
        buttonPlay = false;
        button.attr("xlink:href", `public/data/bubble/pause.svg`);
        enableCursor();
      }
      let tmpYear = new Date(year);
      updateVideoAnchor(tmpYear);
    }

    function updateShowupText(year, dataset, showupText, showupLifeCycle) {
      if (getSelectedLabel().length === 0) {
        // let formatter = d3.timeFormat("%Y-%m-%d");
        // let trueText = Object.keys(showupLifeCycle).filter(key => {
        //   let cycle = showupLifeCycle[key];
        //   for (let timestamp of cycle) {
        //     if (formatter(timestamp[0]) === formatter(year)) {
        //       return true;
        //     }
        //   }
        //   return false;
        // });

        // console.log(trueText);

        showupText.data(dataset)
          .attr("transform", d => `translate(${x(d.forward + 1)+margin.left}, ${y(d.freq + 1)+margin.top})`)
          // .filter(d => trueText.findIndex(text => text === d.label.slice(1)) >= 0 || (d.forward + 1 >= 800 || d.freq + 1 >= 50000))
          .filter(isVisible)
          .style("fill-opacity", 1)
          .transition()
          .duration(1000)
          .style("fill-opacity", 0);
      }
    }

    function updateTraj(currentDate) {
      let selectedLabel = getSelectedLabel();
      // let date = d3.timeFormat("%Y%m%d")(currentDate);

      selectedLabel.forEach(label => {
        let selector = d3.select(`#input-${label}`);
        updatePast(selector, currentDate);
      });
    }

    function computeCoord(x1, y1, r1, x2, y2, r2) {
      x1 = parseFloat(x1); y1 = parseFloat(y1); r1 = parseFloat(r1);
      x2 = parseFloat(x2); y2 = parseFloat(y2); r2 = parseFloat(r2);
      let dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

      let lineCoord;
      if (dist === 0) {
        lineCoord = {
          x1,
          y1,
          x2,
          y2,
        }
      } else {
        lineCoord = {
          x1: x1 + (x2 - x1) * r1 / dist,
          y1: y1 + (y2 - y1) * r1 / dist,
          x2: x2 + (x1 - x2) * r2 / dist,
          y2: y2 + (y1 - y2) * r2 / dist,
        };
      }

      return lineCoord;
    }

    function updateVideoAnchor(date) {
      let width = d3.select(".video-slider").attr("width");
      let timeScale = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width]);
      let pos = parseFloat(timeScale(date));
      pos = Math.min(pos, width);
      d3.select(".video-anchor")
        .attr("cx", pos + parseFloat(d3.select(".video-slider").attr("x")));
    }

    function textPosition(textData){
      text.data(textData).each(function(d) {
        d.width = this.getBBox().width;
        d.x = x(d.forward + 1)+margin.left;
        d.y = y(d.freq + 1)+margin.top;
        d.r = r(d.trend);
        d.height = this.getBBox().height;
      })

      var labels = d3.labeler()
              .label(textData)
              .anchor(textData)
              .width(width)
            .height(height)
            .start(0);;

      text.attr("x", function(d) {
          return d.x;
        }).attr("y", function(d) {
          return d.y;
        })
        .style("text-anchor", "middle")
        .style("fill", function(d) { return "#242424"; })
        .style("display",function(d) {
          if(!isVisible(d)){
            return 'none';}});
    }

    function createHeaderPanel() {
      // let headerHeight = 50;

      // let slider = d3.select(".video-slider");

      // d3.select(".header")
      //   .style("margin-left", `${margin.left}px`)
        // .style("width", `${slider.attr("width")}px`)
        // .style("min-width", `${slider.attr("width")}px`)
        // .style("max-width", `${slider.attr("width")}px`)
        // .style("height", `${headerHeight}px`)
        // .style("min-height", `${headerHeight}px`)
        // .style("max-height", `${headerHeight}px`);
    }

    function createAsidePanel(labelSet) {
      let asideWidth = 220;
      let lineHeight = 24; // 和css联动
      let aside = d3.select(".container")
        .append("div")
        .attr("id", "aside")
      document.querySelector("div#aside").style.width = `${asideWidth}px`;
      // document.querySelector("div#aside").style.height = `${anchor.attr("cy")}px`;
      // document.querySelector("div#aside").style.margin = `${margin.top}px 0 ${svgHeight - anchor.attr("cy")}px 0`;

      let eleOfAllNnone = aside.append("div")
        .attr("id", "eleOfAllNnone");
      let eleOfLabelRow = aside.append("div")
        .attr("id", "eleOfLabelRow")
        .style("max-height", `${2 * anchor.attr("cy") - lineHeight - svgHeight}px`);

      let eleOfAll = eleOfAllNnone.append("div")
        .attr("class", "allNnone");
      eleOfAll.append("input")
        .attr("type", "checkbox")
        .attr("name", "all")
        .attr("id", 'input-all');
      eleOfAll.append("label")
        .attr("id", "label-all")
        .attr("for", "all")
        .html(lang === "ch" ? "全选" : "all");

      let rows = eleOfLabelRow.selectAll(".labelRow")
        .data(labelSet)
        .enter()
        .append("div")
        .attr("class", "labelRow")
        .attr("id", d => `row-${d}`);

      rows.append("input")
        .attr("type", "checkbox")
        .attr("name", d => d)
        .attr("id", d => `input-${d}`);

      rows.append("label")
        .attr("id", d => `label-${d}`)
        .attr("for", d => d)
        .html(d => `${twitterText[d]}`);

      document.querySelector("div#eleOfLabelRow").style.overflow = "auto";
    }

    function createDownsidePanel(labelSet) {
      let downsideBlockHeight = 135;
      let downsideTitleHeight = 30;
      let downsideHeight = downsideBlockHeight + downsideTitleHeight;

      let downside = d3.select(".container")
        .append("div")
        .attr("class", "downside");

      downside.append("div")
        .attr("id", "downside-title")
        .style("width", `${svgWidth}px`)
        .style("height", `${downsideTitleHeight}px`)
        .text("话题寿命")
        .style("text-align", "center");

      let slider = d3.select(".video-slider");     

      document.querySelector("div.downside").style.width = `${svgWidth}px`;
      document.querySelector("div.downside").style.height = `${downsideHeight}px`;

      let downsideBlock = downside.append("div")
        .attr("id", "downside-block");

      document.querySelector("div#downside-block").style.height = `${downsideBlockHeight}px`;

      let rows = downsideBlock.selectAll(".lifeCycleRow")
        .data(labelSet)
        .enter()
        .append("div")
        .attr("class", "lifeCycleRow")
        .attr("id", d => `lifeCycleRow-${d}`)
        .style("display", "none")
        .on("click", function() {
          let ele = d3.select(this);
          if (ele.style("display") !== "none") {
            ele.style("display", "none");
          }
        });

      rows.append("div")
        .attr("class", "lifeCycleItem-label")
        .attr("id", d => `lifeCycleItem-label-${d}`)
        .attr("width", `${margin.left}px`)
        .style("max-width", `${margin.left}px`)
        .style("min-width", `${margin.left}px`)
        .style("min-height", `${slider.attr("height")}px`)
        .html(d => twitterText[d]);

      rows.append("div")
        .attr("class", "lifeCycleItem-bar")
        .attr("id", d => `lifeCycleItem-bar-${d}`)
        .attr("width", `${slider.attr("width")}px`)
        .style("max-width", `${slider.attr("width")}px`)
        .style("min-width", `${slider.attr("width")}px`)
        .attr("height", `${slider.attr("height")}px`)
        .style("min-height", `${slider.attr("height")}px`)
        .style("border-radius", `${slider.attr("rx")}px`);
        // .html("sdfadsf");
    }

    function updateMask(selectedLabel) {
      if (selectedLabel.length === 0) {
        d3.selectAll(".dot")
          .filter(function(d, i) {
            return mouseoverDot === null || d.label.slice(1) === mouseoverDot;
          })
          .transition()
          .duration(durationTime)
          .attr("opacity", 1);

        d3.selectAll(".dot")
          .filter(function(d, i) {
            return mouseoverDot !== null && d.label.slice(1) !== mouseoverDot;
          })
          .transition()
          .duration(durationTime)
          .attr("opacity", 0.1);

        d3.selectAll(".textLabel")
          .filter(function(d, i) {
            return mouseoverDot === null || d.label.slice(1) !== mouseoverDot;
          })
          .text("");

        d3.selectAll(".textLabel")
          .filter(function(d, i) {
            return mouseoverDot !== null && d.label.slice(1) === mouseoverDot;
          })
          .text(d => twitterText[d.label.slice(1)]);
        return;
      }

      d3.selectAll(".dot")
        .filter(function(d, i) {
          return selectedLabel.findIndex((label) => label === d3.select(this).attr("data-label")) < 0 && (mouseoverDot === null || d.label.slice(1) !== mouseoverDot);
        })
        .attr("opacity", 0.1);

      d3.selectAll(".dot")
        .filter(function(d, i) {
          return selectedLabel.findIndex((label) => label === d3.select(this).attr("data-label")) >= 0 || (mouseoverDot !== null && d.label.slice(1) === mouseoverDot);
        })
        .attr("opacity", 1);

      d3.selectAll(".textLabel")
        .filter(function(d, i) {
          return selectedLabel.findIndex((label) => label === d3.select(this).attr("data-label")) < 0 && (mouseoverDot === null || d.label.slice(1) !== mouseoverDot);
        })
        .text("");

      d3.selectAll(".textLabel")
        .filter(function(d, i) {
          return selectedLabel.findIndex((label) => label === d3.select(this).attr("data-label")) >= 0 || (mouseoverDot !== null && d.label.slice(1) === mouseoverDot);
        })
        .text(d => twitterText[d.label.slice(1)]);
    }

    function enableCursor() {
      horizontalCursor.style("display", d => {
        if (!isVisible(d)) {
          return "none";
        } else {
          return "block";
        }
      });
      verticalCursor.style("display", d => {
        if (!isVisible(d)) {
          return "none";
        } else {
          return "block";
        }
      });
      horizontalText.style("display", d => {
        if (!isVisible(d)) {
          return "none";
        } else {
          return "block";
        }
      });
      verticalText.style("display", d => {
        if (!isVisible(d)) {
          return "none";
        } else {
          return "block";
        }
      });
    }

    function disableCursor() {
      horizontalCursor.style("display", "none");
      verticalCursor.style("display", "none");
      horizontalText.style("display", "none");
      verticalText.style("display", "none");
    }

    function getSelectedLabel() {
      let selection = d3.selectAll("div.labelRow input[type='checkbox']:checked");

      let selectedLabel = [];
      selection.each(d => selectedLabel.push(d));

      return selectedLabel;
    }

    function generateTimeline(dataArray) {
      let timeline = dataArray[0]["value"].map(d => d[0]);
      // timeline.splice(7, 1);
      return timeline;
    }

    function initSelectionPastCircle(labelSet) {
      let pastCircle = {};
      let gPastCircle = svgChart.append("g")
        .attr("class", "pastCircle");
      labelSet.forEach(label => pastCircle[label] = {
        ele: gPastCircle.append("g")
          .attr("class", `pastCircle-${label}`),
        data: [],
      });

      return pastCircle;
    }

    function initSelectionPastLine(labelSet) {
      let pastLine = {};
      let gPastLine = svgChart.append("g")
        .attr("class", "pastLine");
      labelSet.forEach(label => pastLine[label] = {
        ele: gPastLine.append("g")
          .attr("class", `pastLine-${label}`),
        eleMotion: gPastLine.append("g")
          .attr("class", `pastLineMotion-${label}`),
        data: [],
      });

      return pastLine;
    }

    function preCalcSelectionPast(labelSet, timeline) {
      let tweenValue = getTweenValue();
      let dateInterpolator = d3.interpolateDate(startDate, endDate);
      let formatter = d3.timeFormat("%Y-%m-%d-%H-%M-%S");
      let parser = d3.timeParse("%Y-%m-%d-%H-%M-%S");
      let dateArray = tweenValue.map(t => parser(formatter(dateInterpolator(t))));
      labelSet.forEach((label, index) => {
        calcLabelPast(label, index, timeline.slice(), dateArray);
      });
    }

    function calcLabelPast(label, index, timeline, dateArray) {
      let targetPastCircle = pastCircle[label];
      let targetPastLine = pastLine[label];
      // console.log(dateArray);
      dateArray.forEach(currentDate => {
        // let dateIndex = dateArray.indexOf(currentDate);
        // if (!(dateIndex < dateArray.length - 1 && currentDate.getMonth() !== dateArray[dateIndex + 1].getMonth())) {
        //   return;
        // }
        if (currentDate >= timeline[0]) {
          let data = getDataByMonth(dataArray, currentDate)[index]; 
          let cx = x(data.forward + 1) + margin.left;
          let cy = y(data.freq + 1) + margin.top;
          let radius = (!isVisible(data)) ? 2 : r(data.trend);
          let fill = color(data.trend);
          let date = d3.timeFormat("%Y%m%d%H")(currentDate);

          targetPastCircle["ele"].append("text")
            .attr("class", "pastTime")
            .classed(`pastTime-${label}`, true)
            .attr("id", `pastTime-${label}-${date}`)
            .attr("x", cx)
            .attr("y", cy - radius)
            .text(() => {
              let year = currentDate.getFullYear();
              let month = currentDate.getMonth();
              if (month === 0) {
                month = 11;
                year -= 1;
              } else {
                month -= 1;
              }
              let text = d3.timeFormat("%Y.%m.%d")(new Date(year, month));
              return text.slice(0, 7);
            })
            .style("display", "none");
          targetPastCircle["ele"].append("circle")
            .attr("class", "pastCircle")
            .attr("id", `pastCircle-${label}-${date}`)
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", radius)
            .style("fill", fill)
            .style("stroke", fill)
            .classed("disabled", true)
            .on("mouseover", function() {
              d3.select(`#pastTime-${label}-${d3.select(this).attr("id").split("-")[2]}`)
                .style("display", "block");
            })
            .on("mouseout", function() {
              d3.select(`#pastTime-${label}-${d3.select(this).attr("id").split("-")[2]}`)
                .style("display", "none");
            });

          
          if (targetPastLine["data"].length > 0) {
            let length = targetPastLine["data"].length;
            let prevData = targetPastLine["data"][length - 1];
            let prevDate = prevData["date"];
            let prevLine = targetPastLine["ele"].select(`#pastLine-${label}-${prevData["date"]}`);
            let lineCoord = computeCoord(prevData.cx, prevData.cy, prevData.r, cx, cy, radius);
            prevLine.attr("x1", lineCoord.x1)
                .attr("y1", lineCoord.y1)
                .attr("x2", lineCoord.x2)
                .attr("y2", lineCoord.y2);
          }
          targetPastLine["ele"].append("line")
            .attr("class", "pastLine")
            .classed("disabled", true)
            .attr("id", `pastLine-${label}-${date}`)
            .attr("x1", cx + radius)
            .attr("y1", cy + radius)
            .attr("x2", cx + radius)
            .attr("y2", cy + radius)
            .style("stroke", fill);
          targetPastLine["eleMotion"].append("line")
            .attr("class", "pastLineMotion")
            .classed("disabled", true)
            .attr("id", `pastLineMotion-${label}-${date}`)
            .attr("x1", cx + radius)
            .attr("y1", cy + radius)
            .attr("x2", cx + radius)
            .attr("y2", cy + radius)
            .style("stroke", fill);

          targetPastCircle["data"].push({
            cx, cy, r: radius, fill, date,
          });
          targetPastLine["data"].push({
            cx, cy, r: radius, stroke: fill, date,
          });

          timeline.shift();
        }
      });
    }

    function updatePast(selector, currentDate, reRenderLine = false) {
      let label = selector.attr("name");
      let date = d3.timeFormat("%Y%m%d%H")(currentDate);

      let targetPastCircle = pastCircle[label];
      let targetPastLine = pastLine[label];

      // if input is unchecked, we just disable all of them
      if (!selector.property("checked")) {
        targetPastCircle["ele"].selectAll("circle")
          .classed("disabled", true);
        targetPastLine["ele"].selectAll("line")
          .classed("disabled", true);
        targetPastLine["eleMotion"].selectAll("line")
          .classed("disabled", true);
        return;
      }
      // else we filter elements by currentDate
      targetPastCircle["ele"].selectAll("circle")
        .filter(function() {
          return d3.select(this).attr("id").split("-")[2] < date;
        })
        .classed("disabled", false);

      targetPastCircle["ele"].selectAll("circle")
        .filter(function() {
          return d3.select(this).attr("id").split("-")[2] >= date;
        })
        .classed("disabled", true);

      targetPastLine["ele"].selectAll("line")
        .filter(function() {
          let nxSibling = d3.select(this.nextSibling);
          let node = d3.select(this);
          return node.attr("id").split("-")[2] < date && nxSibling.attr("id").split("-")[2] < date;
        })
        .classed("disabled", false);

      targetPastLine["ele"].selectAll("line")
        .filter(function() {
          let nxSibling = d3.select(this.nextSibling);
          let node = d3.select(this);
          return node.attr("id").split("-")[2] >= date || node.attr("id").split("-")[2] < date && nxSibling.attr("id").split("-")[2] >= date;
        })
        .classed("disabled", true);

      let index = -1;
      targetPastLine["eleMotion"].selectAll("line")
        .filter(function(_, i) {
          let nxSibling = d3.select(this.nextSibling);
          let node = d3.select(this);
          if (node.attr("id").split("-")[2] < date && nxSibling.attr("id").split("-")[2] >= date) {
            index = i;
            return true;
          } 
          return false;
        })
        .classed("disabled", false);

      targetPastLine["eleMotion"].selectAll("line")
        .filter(function() {
          let nxSibling = d3.select(this.nextSibling);
          let node = d3.select(this);
          return node.attr("id").split("-")[2] >= date || nxSibling.attr("id").split("-")[2] < date; 
        })
        .classed("disabled", true);

      if (index >= 0) {
        let data = targetPastLine["data"][index];
        let line = targetPastLine["eleMotion"].select(`#pastLineMotion-${label}-${data.date}`);
        let targetCircle = d3.select(`.dot[data-label = ${label}]`);
        let lineCoord = computeCoord(data.cx, data.cy, data.r, targetCircle.attr("cx"), targetCircle.attr("cy"), targetCircle.attr("r"));
        line.attr("x1", lineCoord.x1)
          .attr("y1", lineCoord.y1)
          .attr("x2", lineCoord.x2)
          .attr("y2", lineCoord.y2);
      }
      
    }

  });
})();

async function getExplanation() {
  let dataset = await d3.csv("public/data/hashtag_bubble_explanation.csv");

  let en2ch = {};

  dataset.forEach(d => en2ch[d.en] = d.ch);

  return en2ch;
}

function getTwitterEnglish() {
  return {
    abtv: "ABTV",
    betteroffout: "BetterOffOut",
    brexitbetrayal: "BrexitBetrayal",
    brexitchaos: "BrexitChaos",
    brexitmayhem: "BrexitMayhem",
    brexitshambles: "BrexitShambles",
    brexitvote: "BrexitVotes",
    chequers: "Chequers", 
    corbyn: "Corbyn",
    daxit: "daxit",
    dc: "dc",
    dup: "DUP",
    election2016: "election2016",
    farage: "Farage",
    fbpe: "FBPE",
    finalsay: "FinalSay",
    frexit: "Frexit",
    ge17: "GE17",
    gowto: "goWTO",
    gtto: "GTTO",
    honda: "Honda",
    indyref2: "indyref2",
    ireland: "Ireland",
    labour: "Labour",
    leave: "Leave",
    leaveeu: "LeaveEU",
    leavemeansleave: "LeaveMeansLeave",
    leavewatch: "LeaveWatch",
    maga: "MAGA",
    marchtoleave: "MarchToLeave",
    maymustgo: "MayMustGo",
    merkel: "Merkel",
    nexit: "Nexit",
    nhs: "NHS",
    no2eu: "No2EU",
    nobrexit: "NoBrexit",
    noconfidence: "Noconfidence",
    nodeal: "NoDeal",
    nodealbrexit: "NoDealBrexit",
    nowaymay: "NoWayMay",
    obama: "Obama",
    peoplesvote: "PeoplesVote",
    peoplesvotemarch: "PeoplesVoteMarch",
    putittothepeople: "PutItToThePeople",
    projectfear: "ProjectFear",
    racism: "racism",
    regrexit: "REGREXIT",
    remain: "Remain",
    remainernow: "RemainerNow",
    revokea50: "RevokeA50",
    scotland: "Scotland",
    standup4brexit: "StandUp4Brexit",
    stopbrexit: "StopBrexit",
    stoptheeu: "StopTheEU",
    strongerin: "StrongerIn",
    takecontrol: "TakeControl",
    theresamay: "TheresaMay",
    tories: "Tories",
    trump: "Trump",
    voteleave: "VoteLeave",
    voteout: "VoteOut",
    voteremain: "VoteRemain",
    waton: "WATON",
    windrush: "Windrush",
    yeseu: "YesEU",
  };
}

function getTwitterChinese() {
  return {
    abtv: "投给留欧派吧亲！",
    betteroffout: "离开更棒！", 
    brexitbetrayal: "背叛了脱欧！",
    brexitchaos: "脱欧混乱",
    brexitmayhem: "脱欧暴乱",
    brexitshambles: "脱欧跌跌撞撞",
    brexitvote: "脱欧协议投票",
    chequers: "梅的脱欧方案",
    corbyn: "科尔宾",
    daxit: "丹麦也脱欧",
    dc: "华盛顿",
    dup: "北爱尔兰民主统一党",
    election2016: "2016年美国大选",
    farage: "法拉奇",
    fbpe: "支持欧盟就回粉！",
    finalsay: "要最后定夺！",
    frexit: "法国也脱欧",
    ge17: "英国2017大选",
    gowto: "直接WTO！",
    gtto: "保守党滚蛋！",
    honda: "本田汽车",
    indyref2: "苏格兰二次独立公投",
    ireland: "爱尔兰",
    labour: "工党",
    leave: "脱！",
    leaveeu: "脱欧！",
    leavemeansleave: "脱就是脱！",
    leavewatch: "盯着脱欧派",
    maga: "让美国再次伟大",
    marchtoleave: "脱欧者游行！",
    maymustgo: "梅得下台！",
    merkel: "默克尔",
    nexit: "荷兰也脱欧",
    nhs: "医疗系统",
    no2eu: "对欧盟说不！",
    nobrexit: "绝不脱欧！",
    noconfidence: "不信任投票",
    nodeal: "无协议！",
    nodealbrexit: "无协议脱欧",
    notbuyingit: "我不买帐！",
    nowaymay: "没门儿！梅",
    obama: "奥巴马",
    peoplesvote: "人民的投票",
    peoplesvotemarch: "人民的投票的游行",
    putittothepeople: "让人民来决定！",
    projectfear: "恐吓阴招",
    racism: "种族仇视",
    regrexit: "后悔脱欧",
    remain: "留！",
    remainernow: "曾脱现留",
    revokea50: "撤销脱欧！",
    scotland: "苏格兰",
    standup4brexit: "坚持脱欧！",
    stopbrexit: "停下脱欧！",
    stoptheeu: "挡住欧盟！",
    strongerin: "留下会更强！",
    takecontrol: "拿回控制权！",
    theresamay: "特蕾莎梅",
    tories: "保守党",
    trump: "特朗普",
    voteleave: "投脱！",
    voteout: "投走！",
    voteremain: "投留！",
    waton: "轮我们反对！",
    windrush: "疾风号轮船",
    yeseu: "对欧盟说是！",
  };
}

function getTweenValue() {
  return [
    0.0000069166667041524,0.00023562500003511863,0.0003990833333470315,0.0004905833334002334,0.0005440000000817236,0.0006773750000623598,0.0008154166667130387,0.000964416666708227,0.001088750000053551,0.0012354583333944902,0.0013781250000950726,0.0015205000000908817,0.0016562916667074508,0.001790166666736089,0.0019314166667754762,0.002069041666739698,0.0022053750000244083,0.0023503333333792396,0.0024893333333845173,0.0026230000000699266,0.0029047916667574707,0.003040083333447304,0.0031770833333818397,0.003322958333349864,0.0034563333333305006,0.0036034583333578968,0.0037385416667045017,0.0038728750000397365,0.0040216250000715565,0.004156583333436477,0.0043017500000132715,0.0044333750000078,0.004573375000109081,0.004707916666666279,0.004852333333352969,0.004989583333372139,0.005133916666697284,0.005268416666755608,0.005406625000008111,0.005546375000024758,0.005684041666730384,0.005824166666692084,0.005963750000106908,0.006097250000069229,0.006242500000007567,0.006376291666674661,0.006508625000060419,0.006656250000014552,0.006793416666672177,0.006929791666698293,0.007078125000043655,0.007213333333371944,0.007345583333396159,0.007490666666732674,0.007630458333369461,0.0077731250000700434,0.007901833333380636,0.008040250000097634,0.008189958333362786,0.008323083333380055,0.008465958333423866,0.008610125000025922,0.00874175000002045,0.00888637500005037,0.009023583333328134,0.009154500000052697,0.009302333333350059,0.009431666666690338,0.00957962500009065,0.009710916666760265,0.009853833333424215,0.009994708333397283,0.010135583333370354,0.010280541666725184,0.010408125000079356,0.010551874999994956,0.010688625000087389,0.01082337500010908,0.01096866666666756,0.011107500000071014,0.011249000000073768,0.01137741666667959,0.011524916666773303,0.011657500000001163,0.011804208333342104,0.011945583333363175,0.012079041666705355,0.012219416666751689,0.012354875000043345,0.012492166666682654,0.012630916666724563,0.012780500000008032,0.012906625000080869,0.01305391666671009,0.01319700000009713,0.013332041666702328,0.013470208333334692,0.01361483333336461,0.013742083333393868,0.013889125000059722,0.014020333333367793,0.014156666666773768,0.014304666666672954,0.014434750000024603,0.01458224999999705,0.014722250000098332,0.014860833333417152,0.014996874999997089,0.015133250000023206,0.015278916666769267,0.015412416666731588,0.015556625000075049,0.015695666666700466,0.015833875000074233,0.015969083333402523,0.016119000000010906,0.016256458333373303,0.0163837500000227,0.016529958333436904,0.01666729166669635,0.016808666666717424,0.016948125000029297,0.017084458333435273,0.017222666666687775,0.017364708333358674,0.017495250000016917,0.017632333333434266,0.017778666666708888,0.017919916666748272,0.018058458333446954,0.018198541666667248,0.018332291666714202,0.01847145833344257,0.018613000000065463,0.018751833333347654,0.018888666666680366,0.019027166666758907,0.01916687500003415,0.019308708333361815,0.019446708333392355,0.019588541666720024,0.01972625000004579,0.01986808333337346,0.02000700000001719,0.02013966666672786,0.02028375000008964,0.020414958333397713,0.020563833333411215,0.020704458333420918,0.020844541666762476,0.020977541666676796,0.02111241666668017,0.02125045833333085,0.02138991666676399,0.021537125000031666,0.021674541666773923,0.021809875000083898,0.021951666666670158,0.02208587500002371,0.022230625000035312,0.022366333333411603,0.022503000000021225,0.02265204166675782,0.022786708333417966,0.022927041666722894,0.023066749999998137,0.023193708333443887,0.023334875000000466,0.023472416666724408,0.023624250000041987,0.023751416666709702,0.02389912500002538,0.024039333333348623,0.024171041666704696,0.024315625000114475,0.024457666666664105,0.024590374999994915,0.024730666666679706,0.024869208333378388,0.025010083333351456,0.025146750000082343,0.025286666666700815,0.025427541666673884,0.02555729166670062,0.02570195833335068,0.025842416666758558,0.02597570833337765,0.026120250000046023,0.026258916666726386,0.0264040000000629,0.026543416666754638,0.026678708333444472,0.026812583333351844,0.026955750000100427,0.027094583333382615,0.02724037500011036,0.02736487500005751,0.027505125000000893,0.02764220833341824,0.027789750000010827,0.027926833333428172,0.028070791666687002,0.028205875000033607,0.028342333333421267,0.02848466666667567,0.028623291666735894,0.028762583333445946,0.028903125000094104,0.029040916666781415,0.02917300000008254,0.029311791666744587,0.029458083333399068,0.02959791666677726,0.029740791666699806,0.02986791666674738,0.03001129166671793,0.030155375000079705,0.030290208333341676,0.030436499999996158,0.030569833333356656,0.030715208333397945,0.03084933333338995,0.03099433333336492,0.031127500000002327,0.03126591666671932,0.03140312499999709,0.03153662500008068,0.03167679166666251,0.03181575000004765,0.03196537500007253,0.03209791666668025,0.03224058333338083,0.03237725000011172,0.032513333333433064,0.03265804166670326,0.03279762499999682,0.03292820833339647,0.03307250000010147,0.033207041666779936,0.03334754166668669,0.03348875000010594,0.03363141666668525,0.03377241666676127,0.0339025833333532,0.03404441666668087,0.03418654166671331,0.034323916666714166,0.034458500000012764,0.03460287500007932,0.03474012500009849,0.03488287500003935,0.03501724999999472,0.03515512500004358,0.03529579166667342,0.03543995833339674,0.035574333333352116,0.03571091666672146,0.03585020833343151,0.03598779166677559,0.036129833333446486,0.03626962500008327,0.03641058333341789,0.03655279166669061,0.036684833333371594,0.03682916666669674,0.03696337500005029,0.03710708333334575,0.03724450000008801,0.03738316666676837,0.03751866666668017,0.0376567916666924,0.037796125000022586,0.03793787500010997,0.03808008333338269,0.03822037500006748,0.038359583333415985,0.038498125000114666,0.03863233333334695,0.038775666666697364,0.03891391666669127,0.0390472916666719,0.03919004166673403,0.03933345833344599,0.03946900000009919,0.039601166666761854,0.03974400000006426,0.03988375000008091,0.040019208333372566,0.040155208333332366,0.04030400000010559,0.04044104166678153,0.0405819166667546,0.0407201250000071,0.040861208333444664,0.04099991666674517,0.04113770833343248,0.041271666666701394,0.041412166666729415,0.04155591666676628,0.041688291666772175,0.04182870833343865,0.04196783333342561,0.042102250000001125,0.042249333333408384,0.04238733333343892,0.042528791666700275,0.042662833333330735,0.042800041666729766,0.042944791666741366,0.043080958333424256,0.04321791666673865,0.04336429166675468,0.04349883333343314,0.0436425416667286,0.04377495833335464,0.04392104166666589,0.04405637500009713,0.044189583333354675,0.044327666666746764,0.044468750000063055,0.04461104166669732,0.044752041666773344,0.04489070833333244,0.0450285833333813,0.04516762500000671,0.04530091666674707,0.04544883333340598,0.045586416666750056,0.04572549999999562,0.04586491666668735,0.04600212500008638,0.04614383333343237,0.046278458333351105,0.04641945833342712,0.04655441666667078,0.04669691666676954,0.04683337500003593,0.04697675000000648,0.04711545833342825,0.04725537500004672,0.04739095833344133,0.0475308750000598,0.04766558333334008,0.047807416666667754,0.047950833333379704,0.04808670833335782,0.048228416666703806,0.04836191666666612,0.04850570833344439,0.048642416666674154,0.048782208333432206,0.04892158333338254,0.04906241666673547,0.04919895833336341,0.04933666666668917,0.04947812500007179,0.04961575000003601,0.04975775000008677,0.04989045833341758,0.05003275000005184,0.050172375000086804,0.05031112500000745,0.05045537500009232,0.05058687500010516,0.050729750000027704,0.050861250000040555,0.0510060833334137,0.05114604166677358,0.05128608333337373,0.05141912500002945,0.05156166666674835,0.05170233333337819,0.05184266666668312,0.05198329166669282,0.0521196250000988,0.052255041666770315,0.052399791666781916,0.052533250000002835,0.05266820833336775,0.052811083333411564,0.052957625000029415,0.053091791666762825,0.05323316666666263,0.05337350000008882,0.05351287500003916,0.05364670833344765,0.05378733333333609,0.05392629166672123,0.054066291666701245,0.054208291666752,0.054345000000103026,0.05448237500010388,0.05462437500003337,0.054765541666711215,0.05489775000011529,0.05504241666676535,0.05518162500011385,0.05532062499999787,0.05545662500007893,0.05559579166668603,0.05573045833334618,0.05586779166672689,0.0560096666666747,0.05614595833333927,0.05628945833341277,0.056429750000097555,0.05656845833339806,0.05670754166676488,0.056840375000077374,0.05698320833337978,0.05712820833335475,0.057267208333360034,0.057399250000041015,0.05753487500005576,0.057680125000115365,0.05781579166675025,0.05795954166666585,0.05809325000009267,0.05823441666677051,0.058378000000084286,0.05851900000003904,0.05865045833343174,0.05879170833334987,0.05893050000001191,0.05906600000004498,0.05920783333337264,0.05934691666673946,0.05948895833341036,0.05962491666675002,0.05976591666670477,0.05989933333342681,0.06004270833339736,0.060180541666704813,0.0603157500000331,0.06045891666678169,0.060597041666672645,0.060734083333348586,0.060868708333388595,0.06100804166671878,0.061151083333364414,0.0612923333334038,0.0614312083334274,0.06157012500007113,0.061713208333336905,0.06184841666666519,0.06198720833344851,0.06213241666676671,0.06226779166669682,0.062405166666697674,0.06254525000003923,0.06268166666668548,0.06282083333341386,0.06296637500005696,0.06310112500007865,0.06324579166672871,0.0633787916667643,0.06351279166677462,0.06365712500009976,0.0637945833333409,0.06393200000008316,0.06407158333337672,0.06421104166668859,0.06435258333343276,0.06448700000000826,0.06462383333334097,0.06477045833344164,0.06490600000009485,0.06504625000003822,0.06519020833341832,0.06532266666666449,0.06545858333338402,0.06560212500007764,0.06574525000008483,0.06587495833337016,0.06602116666666309,0.06615858333340535,0.0662915000000794,0.06643687499999942,0.0665720833333277,0.06672079166673939,0.0668538333333951,0.066986208333401,0.06713137500009907,0.06726875000009992,0.06740891666668176,0.0675415416667723,0.0676908750000924,0.06782754166670202,0.06796683333341207,0.06810650000006717,0.0682435000000017,0.0683828333333319,0.06851770833333527,0.06866012500007249,0.0688020416667617,0.06894195833338017,0.06908033333335577,0.06921654166678005,0.06935437500008751,0.0694986250000511,0.06963354166667463,0.06977266666666158,0.06991362499999619,0.0700487083333428,0.07018770833334807,0.07032379166666942,0.07046441666667912,0.0706058333334416,0.07074625000010808,0.07088537500009504,0.07102050000006178,0.07115920833336228,0.07130491666672849,0.07143833333332926,0.07157670833342612,0.07172104166675126,0.07186083333338805,0.07199520833334343,0.07213841666671214,0.07227408333334703,0.07241495833344137,0.07255479166669829,0.07269470833343802,0.07283308333341362,0.07296962500004156,0.07311700000003232,0.0732496250000016,0.07338820833344167,0.07352437500000329,0.07366104166673419,0.07380770833333372,0.07394300000002356,0.07408595833342892,0.07422445833338619,0.07436233333343505,0.0745000000000194,0.07463900000002469,0.07477862500005965,0.07491537500003081,0.07505512500004746,0.07519033333337574,0.07533350000000306,0.07547174999999698,0.07561225000002499,0.07575229166674641,0.0758860416666721,0.07603241666668813,0.07617170833339817,0.0763057083334085,0.07644700000006803,0.07658750000009604,0.07671841666669935,0.07686775000001944,0.07700345833339574,0.07713891666668739,0.07728070833339491,0.07742812500000582,0.07755862500004393,0.07769645833335138,0.0778345833333636,0.07797825000003893,0.07811487500002841,0.078253250000004,0.07839054166676457,0.07852904166672185,0.07867237500007225,0.07880987500005479,0.07895070833340773,0.07908208333343889,0.07922916666672487,0.07936570833335281,0.07950691666677207,0.07964137500008898,0.07978604166673904,0.07992387500004648,0.08006083333336088,0.08019554166676243,0.08033700000002379,0.08047887500009286,0.080603875000088,0.08074550000007245,0.08087929166673954,0.0810300000001007,0.08116283333341319,0.08130366666676613,0.08143370833337636,0.08157191666675014,0.08171216666669352,0.08184995833338084,0.0819926250000814,0.08213016666668409,0.0822675000000648,0.08240516666677043,0.08254783333334975,0.08269525000008192,0.08282466666666248,0.0829732916667126,0.08311016666666546,0.08324183333340139,0.08338308333344079,0.08352291666669771,0.08366220833340776,0.08379512500008181,0.08393870833339558,0.08407495833344,0.08422600000000481,0.08436333333338553,0.0844912500000646,0.08463416666672856,0.08477737500009729,0.08491204166675743,0.08504883333334874,0.08518995833340644,0.0853344583333334,0.08547595833333617,0.08561166666671245,0.0857450416666931,0.08588491666669143,0.08601700000011382,0.08616170833338402,0.08630625000005239,0.08643741666674032,0.08658254166669697,0.08672091666667256,0.08685550000009243,0.08699695833335379,0.0871338333334279,0.08727804166677136,0.08742162500008514,0.08755320833333827,0.0876883750000464,0.08783995833340062,0.08797491666676555,0.08811520833332906,0.08825125000003027,0.08839495833344699,0.08852295833336636,0.0886733333334026,0.08881262500011265,0.08894154166676647,0.08908987500011184,0.08922620833339655,0.08935854166666105,0.08950254166666127,0.08963587500002176,0.08978416666674699,0.08991466666666384,0.09006137500000477,0.09019095833342969,0.09033233333332949,0.09046720833333287,0.09061166666676096,0.09075858333344514,0.09088875000003706,0.09103300000000066,0.09116495833344136,0.09130637500008258,0.09144525000010617,0.09158058333341615,0.09172908333336333,0.09186712500001401,0.09200675000004897,0.09214004166666806,0.09228370833334339,0.09241666666675882,0.09255529166669779,0.09270291666677319,0.09284308333335503,0.0929706666667092,0.0931209583333839,0.09325062500004909,0.0933924999999969,0.09353508333333593,0.09367641666673686,0.09380816666671307,0.09395258333339977,0.0940924583333981,0.09423033333344695,0.09436916666672915,0.09449945833342402,0.09465220833335479,0.09479275000000295,0.09492404166667257,0.0950657083333984,0.09519641666677975,0.09533870833341401,0.09547970833336876,0.09561983333333046,0.09575300000008914,0.09589804166668424,0.09603850000009212,0.09617591666671312,0.09631929166668367,0.0964567916666662,0.09659162500004943,0.09673349999999724,0.09686641666667128,0.0970142083333485,0.09714816666673869,0.09727950000002844,0.09742595833340602,0.09755808333344855,0.09770725000004556,0.09784970833340291,0.09798354166669014,0.09812708333338378,0.09825425000005149,0.09840145833344044,0.09854275000009996,0.09867233333340361,0.09881175000009534,0.0989513333333889,0.09909737500008002,0.09923604166676038,0.09937337500001983,0.09951866666669958,0.09965504166672569,0.09979120833340857,0.09992966666674571,0.10006450000000769,0.10021033333335556,0.10033766666674637,0.10048629166667525,0.10061741666674304,0.10076516666667885,0.10090887500009557,0.10104108333337838,0.10117487500004547,0.10132354166671576,0.10145641666676966,0.10159083333334516,0.1017394583333953,0.10187733333344416,0.10200862500011378,0.1021552916667133,0.1022840000000239,0.10243408333335538,0.10257416666669693,0.10270854166677358,0.10284175000003112,0.10299387500005347,0.10312475000003664,0.10325820833337881,0.10339620833340936,0.10355033333338118,0.10368291666673031,0.1038227083333671,0.10396158333339069,0.10410179166671393,0.10424087500008075,0.1043806250000974,0.10451375000011467,0.10464833333341327,0.10480166666675358,0.10493008333335942,0.10507283333342153,0.10521350000005138,0.10535104166677532,0.10549387500007773,0.10561966666670439,0.10576779166670652,0.10589925000009923,0.1060464583333669,0.10618458333337913,0.10632295833335471,0.10646779166672786,0.10660279166671292,0.10674091666672515,0.10688012500007366,0.10701933333342216,0.10715591666667024,0.10729129166672162,0.10743270833336283,0.10756737500002297,0.10771712500002953,0.10784520833343171,0.10799400000008366,0.10812725000008262,0.1082762500000778,0.10840641666666974,0.10855450000005172,0.10869058333337307,0.10882620833338781,0.10896575000006123,0.10910637500007093,0.10924750000000737,0.10938454166668331,0.10951833333335041,0.1096550000000813,0.10980170833342223,0.10993850000001354,0.11007595833337594,0.11021975000003295,0.11035908333336314,0.11048679166669899,0.11063991666669608,0.11077191666675693,0.1109169166667319,0.11104845833336488,0.11118879166666981,0.11132670833333881,0.11146770833341482,0.11160662500005855,0.11174887500007268,0.1118879166666981,0.11202991666674886,0.11216250000009799,0.11230312500010768,0.11244008333342208,0.1125815000000633,0.11271650000004835,0.11286287500006438,0.11298966666666578,0.11312929166670074,0.1132901666667749,0.11340945833338385,0.11355587500002003,0.11369350000010552,0.1138291666667404,0.11397604166668315,0.11411066666672316,0.11425191666676256,0.11438912500004032,0.11452625000007781,0.11466579166675123,0.11480916666672177,0.11494062500011447,0.11508216666673737,0.11521866666674517,0.11535879166670687,0.1155049999999998,0.11563908333337167,0.11578241666672208,0.11591795833337529,0.11605475000008786,0.11619412500003819,0.1163365416667754,0.1164692500001062,0.11661708333340357,0.11675125000001571,0.11688720833335538,0.11703008333339919,0.11716904166666306,0.11730616666670055,0.11745062500000737,0.11758216666676162,0.11772520833340726,0.1178627083333898,0.11799958333334265,0.11813829166676441,0.11828087500010345,0.11841920833333765,0.11855887500011401,0.11869929166678048,0.11883820833342422,0.11897625000007489,0.1191130833334076,0.11925437500006714,0.11939204166677277,0.11952695833339627,0.11966945833337377,0.11980766666674754,0.11994870833344369,0.12009120833342118,0.1202192916667021,0.12037150000008599,0.12050762500002747,0.12064937500011487,0.12078583333338126,0.12091720833341242,0.12106487500010796,0.12119566666672957,0.12134120833337268,0.12147362499999872,0.12161516666674288,0.12175804166666543,0.12189987500011436,0.1220354583333877,0.12217287500000869,0.12231150000006892,0.12245404166666655,0.12258745833338859,0.12272616666668909,0.12286758333333031,0.12300225000011172,0.12314508333341413,0.12328625000009197,0.12342308333342468,0.12355741666675991,0.12369995833335755,0.1238414583333603,0.12398133333335863,0.12411841666677598,0.12425495833340391,0.12439754166674295,0.12453912500010726,0.12467125000002852,0.12481304166673605,0.12495383333334757,0.12509362500010562,0.12522979166666726,0.12536629166667504,0.12550695833342615,0.12564804166674245,0.12578854166677048,0.12592612500011455,0.12606358333335568,0.12620212500005437,0.12634287500004576,0.12648162500008767,0.12662129166674277,0.12676087500003633,0.1268971666667009,0.12703579166676113,0.1271775833333474,0.1273135000000669,0.12745708333338068,0.12759754166666729,0.1277345416667231,0.1278653750000861,0.12801762500009015,0.12815416666671808,0.12828750000007857,0.1284294166667678,0.1285685833333749,0.12870566666667096,0.12884816666676974,0.12898516666670426,0.12912212500001866,0.12926620833338046,0.12939975000008416,0.12953875000008944,0.12967958333344237,0.12982475000001917,0.12995770833343462,0.13009933333341905,0.1302354166667404,0.13037820833342267,0.1305073333334197,0.1306465000000268,0.1307910416666952,0.1309280000000096,0.1310704166667468,0.13121208333335138,0.13134216666670304,0.131494041666762,0.1316292083333489,0.1317605416667599,0.13189833333344722,0.13204216666672436,0.13218229166668607,0.13232583333337972,0.132461541666756,0.1325987083334136,0.13273283333340563,0.13287237500007903,0.13300850000002054,0.13314916666677162,0.13329654166676239,0.1334277916666906,0.13357075000009597,0.13371041666675107,0.1338505833333329,0.13398904166667006,0.13412162500001917,0.13426608333344728,0.13440512500007268,0.1345440416667164,0.1346849166666895,0.13482441666674277,0.1349581250000483,0.1350969583333305,0.13524016666669922,0.13538195833340674,0.13551808333334822,0.13565733333343816,0.13579479166667927,0.13593608333333881,0.13607254166672647,0.13620887500001116,0.13635312500009605,0.13649416666667094,0.13662987500004722,0.1367688750000525,0.13691016666671202,0.13704912500009717,0.13718491666671373,0.1373227500000212,0.137465625000065,0.13760650000003807,0.1377395416666938,0.1378825416667193,0.13802137500000147,0.13816008333342325,0.13829808333333252,0.13843637500006784,0.1385783749999973,0.13871204166668274,0.13885312499999902,0.13898858333341196,0.1391350000000481,0.13927516666675122,0.13940766666673882,0.13955766666670874,0.13968704166666915,0.13983500000006946,0.13996816666670686,0.14010512500002126,0.14024416666676795,0.140380750000016,0.1405194166666964,0.14066420833332813,0.1408049166666994,0.14093645833333238,0.14107966666670108,0.1412180833334181,0.1413612500000454,0.14149525000005572,0.1416389583333512,0.1417679166667464,0.1419177500001145,0.14205225000005156,0.14218695833333186,0.14233029166668226,0.14246941666666924,0.1426079583333679,0.14274987500005712,0.1428845833333374,0.1430313750000399,0.14316483333338206,0.14330233333336462,0.143443083333356,0.14357987500006858,0.14371991666666872,0.14386383333342867,0.14400187500007935,0.14413154166674455,0.14427616666677448,0.14441525000002003,0.14454945833337357,0.14469450000008996,0.14483700000006744,0.14496858333344184,0.1451121666667556,0.14524858333340188,0.14538520833339136,0.14552487500004646,0.1456651250001111,0.14580325000000205,0.14594416666671653,0.14608429166667822,0.1462215833334388,0.14635929166676456,0.14649895833341967,0.14664108333333084,0.14677937500006616,0.14691666666670547,0.14705954166674928,0.14719991666667434,0.14733154166666887,0.14747233333340168,0.14761216666677987,0.1477521666667599,0.14789720833335498,0.14803558333333058,0.14817175000001345,0.14830508333337397,0.14844312500002463,0.14858520833343694,0.1487224166667147,0.1488580833333496,0.14900216666671137,0.14913583333339678,0.14927970833341533,0.14942183333344777,0.14956150000010288,0.14969545833337178,0.14983179166677776,0.14997008333339182,0.15011241666676747,0.15026008333334176,0.1503952500000499,0.15054050000010952,0.1506701666667747,0.1508135833333654,0.15094845833336876,0.15108545833342457,0.15122145833338435,0.15136012500006474,0.15150300000010855,0.1516435416667567,0.15178154166666596,0.15192020833334632,0.15206804166676496,0.15219791666677338,0.15233587500006252,0.1524753333333744,0.15261241666667047,0.1527505833334241,0.15289137500003563,0.15303308333338161,0.1531740000000961,0.1533076666667815,0.1534521250000883,0.15358395833342608,0.15373845833334296,0.15386850000007446,0.15400970833337244,0.15414100000004208,0.1542864583334449,0.15442558333343187,0.15456041666669382,0.15471141666675975,0.15483937500005898,0.15498183333341634,0.1551130416667244,0.15526291666671266,0.15539470833343028,0.15553308333340585,0.15567308333338586,0.15582033333339496,0.1559582916666841,0.15609250000003763,0.15623279166672244,0.15637295833342554,0.15650958333341503,0.1566471666667591,0.15679258333342053,0.15692487500006488,0.15706941666673327,0.1572032916667619,0.1573434166667236,0.15748450000003988,0.15762729166672215,0.15775683333340568,0.15790183333338065,0.15804041666669946,0.15818137500003407,0.15831787500004188,0.15845262500006357,0.1585965000000821,0.15873145833344704,0.15887270833336514,0.15901283333344812,0.15915183333333213,0.15928850000006303,0.15943041666675223,0.15957187500001357,0.1597087500000877,0.15984454166670428,0.1599869166667001,0.16012304166676283,0.16026666666669673,0.16040420833342067,0.16053954166673065,0.16068504166675363,0.1608178750000661,0.16095833333335274,0.16109591666669681,0.1612382500000725,0.16137704166673453,0.16151925000000725,0.1616576250001041,0.16179245833336608,0.1619348750001033,0.16207929166666873,0.1622105416667182,0.16235408333341184,0.16248745833339248,0.16262816666676372,0.16277483333336326,0.1629039583333603,0.16304687500002427,0.16318412500004342,0.16332920833337994,0.1634601250001045,0.1635970833334189,0.16374166666670742,0.1638750000000679,0.1640246250000928,0.1641430416667087,0.16427883333344653,0.1644266250000025,0.1645582916667384,0.1646986666666635,0.16483345833342658,0.16498033333336934,0.1651156250000592,0.16525475000004614,0.16539762500008995,0.16553016666669768,0.16566825000008975,0.16581837500004137,0.16595087500002895,0.1660966250000153,0.16622854166671458,0.16636391666676598,0.16651150000009995,0.1666470833333733,0.16678608333337858,0.16691987500004568,0.1670658749999954,0.16719758333335147,0.16733691666668166,0.167485250000027,0.16762275000000953,0.16775416666666085,0.167892624999998,0.16804166666673456,0.16817487500011338,0.16831112500003656,0.16844966666673525,0.16859720833332784,0.168725791666778,0.1688735416667138,0.16901312500000737,0.16914200000004107,0.16929212500011392,0.16942129166673112,0.1695652083333698,0.16969875000007353,0.16984670833335258,0.16998154166673582,0.17012483333334483,0.17025716666673057,0.17040212500008542,0.17053887500005657,0.1706755833334076,0.17081708333341036,0.17095750000007684,0.17109462500011433,0.1712326250000236,0.17137237500004024,0.17150637500005056,0.17164545833341738,0.17179454166677413,0.1719292500000544,0.1720638750000944,0.1722062500000902,0.17234800000005635,0.172483458333348,0.1726245416666643,0.17276279166677946,0.17289779166676453,0.17303525000000566,0.1731857500000236,0.1733195833334321,0.1734647916667503,0.17359283333341105,0.17373054166673682,0.17387250000004617,0.17401491666666213,0.17415850000009717,0.17428641666677624,0.17442858333342884,0.17456433333342528,0.17470350000003237,0.17484233333343582,0.17499125000006946,0.17512054166666832,0.1752593750000718,0.17540495833333505,0.17554558333334475,0.1756828333333639,0.17582099999999629,0.17596225000003565,0.17610345833333366,0.1762390833333484,0.1763768750000357,0.17650995833343283,0.1766544583333598,0.1767973333334036,0.1769374583333653,0.17706600000007408,0.1772165833333323,0.177344750000096,0.1774922916666886,0.1776315416667785,0.1777670833334317,0.1779062916667802,0.17804862500003463,0.17817845833342288,0.1783257500000521,0.1784582500000397,0.1785953750000772,0.1787427083334478,0.1788832916667161,0.17901950000001912,0.17915175000004335,0.1793037083333426,0.17943287500008107,0.17957916666673554,0.17971333333334769,0.179857000000023,0.17999170833342457,0.18013183333338625,0.18027587500000664,0.18041083333337155,0.1805507083333699,0.1806875416667026,0.18081958333338358,0.1809635000000223,0.1811081250000522,0.1812454166666915,0.18138541666667152,0.18152191666667933,0.18166179166667765,0.18180175000003754,0.1819329583333456,0.18207000000002155,0.18221937500008303,0.18235441666668825,0.18249762500005698,0.18263266666666217,0.1827775416667767,0.18291404166666325,0.1830562916666774,0.1831916250001086,0.18332675000007537,0.1834628333333967,0.18360929166677428,0.1837405833334439,0.18388779166671157,0.18402362500006955,0.18416300000001987,0.1843059166666838,0.18444212500010812,0.18458258333339472,0.18471512500000245,0.18485466666667585,0.1849977500000629,0.18513733333335647,0.185267750000033,0.18541729166669635,0.18555520833336533,0.18569008333336873,0.18583408333336895,0.18597187500005627,0.18610600000004826,0.18624562500008324,0.18638216666671117,0.18652591666674803,0.18666745833337092,0.18680775000005573,0.18694854166666725,0.18708154166670282,0.18722458333334846,0.1873632083334087,0.18750075000001137,0.18763991666673974,0.18777766666668563,0.18791641666672756,0.18805308333333717,0.18819720833344036,0.18833316666678002,0.18847758333334544,0.1886153333334126,0.1887499166667112,0.18888754166667543,0.18903024999999615,0.18916675000000396,0.18930504166673928,0.18944883333339627,0.18958037500002925,0.18972654166670205,0.1898675833333982,0.19000033333334918,0.190138916666668,0.1902750833333509,0.19041670833333532,0.19055787500001314,0.19069370833337113,0.19083966666670069,0.1909715833334,0.19111329166674598,0.19125204166666662,0.1913940416667174,0.19153145833333837,0.19167162500004148,0.19181208333332808,0.19194454166669553,0.19209350000007058,0.19222775000004427,0.19236850000003566,0.1924981250000807,0.19264833333339387,0.19278716666667606,0.19291841666672555,0.19306683333343244,0.19319745833333096,0.19334129166672936,0.1934821250000823,0.193614291666745,0.19375979166676796,0.19389104166669616,0.19403862500003016,0.19417729166671052,0.19431016666676443,0.19444825000003524,0.19458320833340015,0.19472379166666845,0.194869749999998,0.1950090833333282,0.19514804166671335,0.1952890833334095,0.19542787500007155,0.19556508333334932,0.19570558333337734,0.195841541666717,0.19598054166672227,0.19611412500004613,0.19626408333339593,0.19640345833334624,0.19653483333337743,0.19666833333333975,0.19681837500005106,0.19695600000001529,0.19709366666672093,0.19722850000010414,0.1973690000000109,0.19750958333340046,0.19764700000002147,0.1977869166667612,0.1979237500000939,0.19806466666668712,0.19820254166673598,0.19835108333342458,0.1984812916667579,0.19862312500008555,0.19876529166673815,0.1988958333333964,0.19904129166667797,0.19917950000005172,0.1993122500000027,0.19945708333337583,0.1995965833334291,0.19973558333343439,0.19987420833337335,0.20001308333339693,0.20015045833339778,0.2002857500000876,0.20043558333333447,0.20056770833337698,0.20070670833338228,0.2008483750001081,0.20098566666674741,0.20112362500003655,0.20126425000004625,0.201405250000001,0.20154116666672053,0.2016806250000324,0.20181845833333986,0.20195900000010927,0.20209720833336178,0.2022347083333443,0.20237608333336538,0.20251775000009123,0.20265100000009018,0.20278716666677307,0.20292400000010577,0.2030730416667211,0.2032067083334065,0.20334212500007803,0.20349083333336845,0.20362512500008353,0.20376795833338596,0.20390583333343482,0.20404366666674226,0.20418349999999919,0.20432500000000195,0.2044660833334395,0.20459587500008639,0.2047441250000702,0.20488262500002746,0.20501391666669708,0.20515495833339326,0.20528983333339662,0.20543904166673504,0.2055762500000128,0.20571283333338214,0.20584950000011304,0.2059889166666835,0.2061273333334005,0.2062662083334241,0.20640662500009058,0.20654975000009776,0.20668637500008724,0.20682450000009947,0.20696316666677983,0.2071056666667573,0.20723987500011087,0.20738591666668071,0.2075207083334438,0.20766095833338719,0.20779320833341142,0.20794008333335418,0.2080758333333506,0.20821900000009919,0.20835420833342747,0.2084932500000529,0.2086305416666922,0.20877108333334035,0.20890979166676213,0.20905458333339386,0.20919183333341304,0.20933029166675018,0.2094642916667605,0.2096058333333834,0.20974120833343476,0.2098845416666639,0.21002545833337838,0.21016491666669027,0.21029954166673026,0.21043979166667365,0.210575874999995,0.21071895833338203,0.2108598333333551,0.21099720833335595,0.21113541666672972,0.21127429166675332,0.2114107916667611,0.21154966666666344,0.21169016666669146,0.21182845833342678,0.21196820833344343,0.2121063750000758,0.21224658333339902,0.21238316666676837,0.2125239583333799,0.21266083333333274,0.2128025000000586,0.2129397916666979,0.21308495833339597,0.21321487500002453,0.2133612083334204,0.21349275000005338,0.2136395416667559,0.21377833333341792,0.21391662500003197,0.2140520416667035,0.21419229166676815,0.2143374166667248,0.21446712500001014,0.21461041666674038,0.21475004166677536,0.21488916666676233,0.2150270416666899,0.21517075000010663,0.2153071666667529,0.21544837500005087,0.21558387500008394,0.21571970833344192,0.2158597083334219,0.21599883333340889,0.2161424583333428,0.2162781666667191,0.2164179583333559,0.21655912500003371,0.2166947916666686,0.2168341666667402,0.21697604166668802,0.21711637500011421,0.21725287500000073,0.2173858750000363,0.21753141666667944,0.21766479166678135,0.21780670833334928,0.2179452916666681,0.21808533333338953,0.21822170833341564,0.21837054166668773,0.21849633333343565,0.21864312500001687,0.21878225000000384,0.21891862500002995,0.2190596666667261,0.21919800000008158,0.21934179166673856,0.2194778750000599,0.21960920833334968,0.21975254166670008,0.219892875000005,0.22003125000010187,0.2201774583333948,0.220305916666742,0.22045333333335293,0.22058558333337713,0.22073000000006385,0.2208681666666962,0.22100270833337465,0.22114508333337046,0.2212851250000919,0.22142162500009968,0.22156337500006582,0.22170266666677588,0.22183529166674512,0.22197783333334276,0.22211920833336382,0.22225429166671043,0.2223939166667454,0.22253187500003455,0.22267570833343295,0.22281104166674293,0.22294820833340054,0.22309316666675538,0.2232327083334288,0.22337258333342713,0.22350770833339387,0.2236404583333448,0.2237805833334278,0.2239242083333617,0.22406583333334615,0.2242006666667294,0.2243415000000823,0.22448120833335755,0.2246257500000259,0.22475516666672773,0.22489991666673934,0.22504058333336918,0.22517429166667474,0.22531462500010094,0.22545216666670362,0.22559237500002685,0.22573279166669333,0.2258773750001031,0.22600591666669062,0.22614925000004102,0.22628591666677192,0.22642816666666477,0.22656450000007075,0.22670670833334347,0.2268427916666648,0.22698062500009353,0.22712333333341425,0.2272618750001129,0.22739804166667454,0.2275351250000919,0.22767850000006243,0.2278103333334002,0.2279495000000073,0.2280980416666959,0.22823179166674284,0.2283678750000642,0.22851541666677805,0.22864841666669236,0.22879016666677973,0.22893233333343233,0.22906604166673789,0.22920545833342962,0.22934412500010998,0.22948204166677896,0.22962529166676784,0.22976529166674783,0.2299012083333461,0.23004562500003278,0.2301812083334274,0.23031891666675317,0.23045754166669213,0.23059745833343187,0.2307325833333986,0.2308755833334241,0.231016624999999,0.23115429166670462,0.23129066666673073,0.23143279166676317,0.23156787500010978,0.23170941666673267,0.23185087500011528,0.23198820833337475,0.23212954166677566,0.23226554166673546,0.23240466666672244,0.2325474166666633,0.23267875000007432,0.23281716666667004,0.23296516666669048,0.2331018750000415,0.23323220833335653,0.23337816666668612,0.2335160833333551,0.2336570000000696,0.2337971666667727,0.23393187500005297,0.23407233333333957,0.23421033333337013,0.2343533333333956,0.23448845833336235,0.23463087500009958,0.23477012500006822,0.23491033333339145,0.23504775000001246,0.2351833750000272,0.23532608333334792,0.2354644583334448,0.23560408333335847,0.2357449166667114,0.23587983333333493,0.23601833333341346,0.23615641666668427,0.2362946666666782,0.23643333333335856,0.2365763750000042,0.2367156250000941,0.23685583333341734,0.23699370833334493,0.23713174999999562,0.23726950000006278,0.23741191666667874,0.23754991666670927,0.23768812500008304,0.23782933333338102,0.23796687500010497,0.23810125000006035,0.2382450000000972,0.23838216666675482,0.23852095833341688,0.2386571666667199,0.23880445833334912,0.23893933333335252,0.23907695833343798,0.23921974999999898,0.2393567500000548,0.23949187500002153,0.2396332500000426,0.23977387500005232,0.2399132083333825,0.24004995833335366,0.2401880833333659,0.24032704166675103,0.24046500000004017,0.24060566666667,0.2407477083333409,0.24088483333337837,0.2410261666667793,0.24116575000007287,0.24130029166675135,0.24143583333340454,0.24158095833336118,0.24172037500005292,0.24185987500010622,0.2420000000000679,0.24213579166668447,0.24227516666675608,0.24241320833340677,0.24254854166671672,0.24269233333337373,0.242825458333391,0.2429680000001099,0.24311183333338704,0.2432484166667564,0.2433814166666707,0.24353245833335677,0.24366370833340625,0.24380308333335657,0.24394504166666592,0.24408304166669648,0.2442219583333402,0.24436875000004268,0.2444976666666965,0.24463308333336803,0.24477241666669822,0.24491616666673507,0.2450515833334066,0.2451934583333544,0.24533266666670292,0.24547233333335802,0.24561145833334497,0.24574716666672128,0.24589079166677644,0.2460330416666693,0.24616741666674594,0.24630379166677205,0.24644995833344485,0.2465902500000084,0.24671991666667356,0.24686337500000566,0.24700204166668602,0.24713545833340808,0.24727637500000127,0.2474172083333542,0.24755900000006173,0.24768429166676167,0.2478205000000647,0.24796416666674,0.24809887500002029,0.24823962500001168,0.24837479166671983,0.2485147500000797,0.2486599583333979,0.24879079166676094,0.24893608333344067,0.24907775000004526,0.24920920833343796,0.24935900000006464,0.2494868333333822,0.2496282500000234,0.24977704166667536,0.24990462500002952,0.25005554166673394,0.2501825416666785,0.2503257083334271,0.25046125000008035,0.2506100416667323,0.25074379166677924,0.25088816666672453,0.25102308333334805,0.2511574583334247,0.2512979166667113,0.2514393333333525,0.2515817083333483,0.2517182083333561,0.2518518750000415,0.2519874583334361,0.25212920833340224,0.2522779583334341,0.25241329166674403,0.2525488333333972,0.25269070833334506,0.2528254166667466,0.2529665000000629,0.2531059999999949,0.2532433749999958,0.2533884583333323,0.25352474999999686,0.25365904166671194,0.25380483333343967,0.25394137500006764,0.2540755833334212,0.2542140416667583,0.25436137500000766,0.25449120833339595,0.25463258333341704,0.25476954166673144,0.2549180000000585,0.25505570833338426,0.2551952083334375,0.25533020833342257,0.2554654166667509,0.2556095416667328,0.2557522083334334,0.25588262500010994,0.25602783333342816,0.256164208333333,0.25630450000001775,0.2564377916667581,0.25658183333337853,0.25672679166673334,0.2568540833333827,0.25699725000001006,0.25713329166671123,0.2572745833333708,0.2574145000001105,0.2575515833334066,0.25769575000000866,0.25782800000003286,0.2579721666667562,0.25810562500009837,0.2582553750001049,0.25838329166666274,0.2585308749999967,0.25867175000009107,0.25880625000002816,0.2589424583333312,0.2590905833333333,0.2592233333334055,0.25936575000002143,0.2595030000000406,0.25964133333339606,0.25978475000010803,0.25992429166678144,0.26006075000004786,0.26019800000006704,0.26033912500000345,0.2604781666667501,0.26061812500011,0.2607558750000559,0.2608938750000865,0.26103062500005764,0.261162916666702,0.2613053333334392,0.2614417916667056,0.2615873333333487,0.26172254166667697,0.26186104166675556,0.2620043750001059,0.262143166666768,0.26228308333338646,0.26242308333336645,0.2625575416666834,0.26270379166671776,0.2628365416666687,0.2629791250000077,0.2631140416667525,0.263250166666694,0.2633910000000469,0.2635376666667677,0.2636744166667389,0.2638139166666709,0.2639517916667197,0.26408370833341904,0.264232000000023,0.26436458333337215,0.26449912500005063,0.2646408750000167,0.26478633333341955,0.2649251250000816,0.2650647916667367,0.2651960000000448,0.26534216666671756,0.26547612500010775,0.2656160000001061,0.2657529583334205,0.2659032500000952,0.26604000000006633,0.26617475000008806,0.26631870833334687,0.26645266666673706,0.2665925416667354,0.2667330833333835,0.26686795833338695,0.2670075416666805,0.26715079166666933,0.26728570833341414,0.26742762500010336,0.26756862500005807,0.2676963750000141,0.2678390416667147,0.26798154166669214,0.2681173750000501,0.2682609166667438,0.26839795833341973,0.26854062499999903,0.26867854166666805,0.2688215000000734,0.268959166666779,0.2690975416667546,0.2692321250000532,0.26937750000009447,0.2695100000000821,0.26964412500007406,0.2697938750000806,0.2699269583333565,0.2700605000000602,0.2702082083333759,0.2703474166667244,0.2704866250000729,0.2706273750000643,0.27075966666670864,0.2708945000000919,0.2710436666666889,0.2711814583333762,0.27132358333340867,0.27145100000003974,0.2715985833333737,0.2717412916666945,0.27187191666671423,0.27201554166676944,0.27215400000010653,0.2722930833333521,0.2724299166666848,0.27257170833339234,0.2727100416667478,0.2728507499999978,0.27298958333340123,0.27311737500009864,0.27326462500010773,0.2734093333333779,0.2735442083333813,0.2736827916667001,0.27382470833338934,0.2739577916666652,0.2740979583333683,0.2742452499999975,0.27437370833334473,0.274520291666704,0.27465100000008535,0.27479562500011523,0.27493841666667623,0.2750697083333459,0.27521529166673037,0.2753485000001092,0.27548975000002734,0.27562645833337834,0.2757709166666852,0.27590520833340026,0.2760506666666818,0.27618954166670545,0.27632495833337695,0.27646491666673684,0.2766059166666916,0.27674000000006344,0.27687920833341195,0.277020083333385,0.27716195833333285,0.27729395833339365,0.2774349583333484,0.2775742500000585,0.27771512500003154,0.27785445833336175,0.277991375000056,0.2781290416667616,0.27826720833339397,0.27840987500009456,0.27854725000009545,0.278693208333425,0.2788270000000921,0.27896337499999696,0.2791077500000635,0.2792462916667622,0.279381791666674,0.2795201666667708,0.2796594166667395,0.27979829166676307,0.27993970833340426,0.2800777083334348,0.28021237500009494,0.2803560833333904,0.2804982916666631,0.2806321250000716,0.2807722083334132,0.28091337500009106,0.2810569583334048,0.28118587500005865,0.28132600000002034,0.28146854166673924,0.28161187500008966,0.281746750000093,0.28188166666671655,0.28202437500003724,0.28216120833336994,0.2823011250001097,0.2824401666667351,0.28258387500003057,0.2827183750000889,0.28286025000003673,0.2829927916667657,0.2831352500000018,0.2832780416666841,0.28341262500010395,0.2835509583333381,0.2836923750001006,0.2838304583333714,0.2839721666667174,0.28410495833340976,0.2842495000000781,0.28438479166676794,0.2845275416667088,0.2846632083333437,0.28480675000003736,0.2849451250000129,0.28508216666668884,0.28522250000011506,0.28535750000010013,0.28549570833335264,0.28564212500011005,0.2857792916667677,0.28591587500001575,0.286053291666758,0.2861967500000901,0.2863342916666928,0.2864657916667056,0.28660950000000107,0.28675279166673134,0.28688420833338263,0.2870262916666737,0.2871702916666739,0.2873053333334004,0.28744112500001695,0.28758866666673083,0.2877243333333657,0.2878584583333577,0.28799966666677695,0.28814245833333796,0.28827629166674645,0.28842200000011264,0.28855733333342265,0.2886952083333502,0.2888327916666943,0.28897633333338796,0.2891155833333566,0.28924858333339215,0.2893873333334341,0.2895262500000778,0.2896684166667304,0.28980812500000563,0.28994691666666766,0.290086791666666,0.29022337500003537,0.2903618750001139,0.29050270833334557,0.29063641666677237,0.2907781249999971,0.29092237500008195,0.29105754166666886,0.29119570833342245,0.29133679166673876,0.29147545833341915,0.2916126666666969,0.2917585000000448,0.2918967083334186,0.29203245833341496,0.29217400000003785,0.2923115416667618,0.29244820833337143,0.2925846250000177,0.2927298750000773,0.29286537500011034,0.2930030833334361,0.2931414583334117,0.29328875000004095,0.29342191666667833,0.2935610833334067,0.2937032500000593,0.2938351250000172,0.2939836250000856,0.2941152916667003,0.2942578333334192,0.29439483333335376,0.2945311666667597,0.2946770000001076,0.2948119583333513,0.2949539166667819,0.2950886666666823,0.2952375833334372,0.2953712083333812,0.2955060416667645,0.2956503750000896,0.2957832083334021,0.29592641666677083,0.2960638333333918,0.29620616666676747,0.29633525000002314,0.2964808750000278,0.2966244166667214,0.29675812500002696,0.29689766666670037,0.2970390833333416,0.29717312500009335,0.29731487500005943,0.2974561250000988,0.2975939583334063,0.2977344166666929,0.2978726666666868,0.2980092916666763,0.2981480416667182,0.2982891250000345,0.298429541666701,0.2985682083333813,0.2987085000000661,0.2988427500000398,0.2989777916667663,0.2991217500000251,0.2992649166667737,0.2994024166667562,0.2995379583334094,0.2996857500000866,0.2998182916666944,0.2999557916666769,0.3000979166667094,0.3002341250000124,0.300371416666773,0.3005171666667593,0.3006545833333803,0.3007921250001042,0.30093200000010256,0.301069333333362,0.30120608333333315,0.30134899999999715,0.3014862500000163,0.30162366666675855,0.30176774999999906,0.3019055000000662,0.30204041666668974,0.30218362500005846,0.3023201250000663,0.3024630416667302,0.3025975416666673,0.3027396666666997,0.3028760416667258,0.30301537500005604,0.30315429166669977,0.3032910833334123,0.3034338750000946,0.3035727083333768,0.3037111250000938,0.3038499166667558,0.3039882916667314,0.3041287083333979,0.3042654583333691,0.3044045416667359,0.3045433750000181,0.3046813333334285,0.30483000000009874,0.3049631249999948,0.3051000833334304,0.30524570833343506,0.3053757500000453,0.30551600000011,0.30566287500005274,0.3058020416667811,0.3059337916667573,0.30607329166668934,0.3062193333333804,0.3063552916667201,0.306489375000092,0.3066290416667471,0.30676920833332894,0.3069071666667393,0.30704441666675847,0.307184000000052,0.3073256666667779,0.3074660000000828,0.3076075833334471,0.30774366666676845,0.30787429166666697,0.3080206250000629,0.30815816666666557,0.3082977916667005,0.30843529166668304,0.3085758750000726,0.3087175833334186,0.30885587500003264,0.30899025000010927,0.30913333333337506,0.30927045833341255,0.30941295833339005,0.3095460416666659,0.30968675000003715,0.30982641666669225,0.3099654583334389,0.3101044166667028,0.31023912500010437,0.3103843333334225,0.31052508333341394,0.3106649583334123,0.31079841666675445,0.31093766666672307,0.31107600000007857,0.31121962500001243,0.3113607916666903,0.3114947083333391,0.3116305000000769,0.3117742916667339,0.3119080416667809,0.312045500000022,0.31219412500007215,0.3123298750000686,0.31246808333344234,0.3126152083333485,0.3127412083334396,0.3128862083334146,0.31302979166672834,0.3131636250000156,0.31330966666670673,0.31344287500008555,0.3135829166666857,0.31372337500009356,0.3138535416666855,0.3140064166667192,0.3141342083334166,0.3142735416667468,0.3144224166667603,0.31455116666669103,0.3146937083334099,0.31483033333339944,0.3149794583333763,0.3151115833334188,0.31524954166670793,0.31539345833334664,0.31553266666669516,0.31567025000003923,0.3158052500000243,0.31594229166670024,0.316077208333445,0.3162174166667683,0.31636229166676155,0.3165020416667782,0.31663904166671275,0.31678220833334003,0.31691587500002544,0.3170648333334005,0.31719600000008846,0.31734170833333336,0.3174808750000617,0.31761895833333254,0.31774470833333907,0.31789400000003903,0.3180280416666695,0.31817020833344334,0.3183061666666617,0.3184544166667668,0.3185854583333518,0.3187330416666858,0.318869083333387,0.3190017083333563,0.31914375000002715,0.3192862083333845,0.31942479166670334,0.31955691666674585,0.31969941666672336,0.3198298333333999,0.31998520833343114,0.3201135000000553,0.3202611250000094,0.3203914166667043,0.3205312500000825,0.32066525000009277,0.3208114166667656,0.32094816666673676,0.3210949166666978,0.321229583333358,0.3213642500000181,0.3215119583333338,0.32164312500002173,0.32178825000009964,0.32191745833333696,0.3220595833333694,0.3222007083334271,0.32233862500009614,0.32248600000008687,0.32261566666675207,0.32276054166674534,0.3228977916667645,0.3230299166666858,0.32317849999999454,0.3233106666667785,0.3234585000000758,0.3235921250000198,0.3237233333333279,0.3238729583333528,0.3240032083334275,0.3241510000001047,0.3242866249999982,0.32441970833339534,0.3245615833333432,0.3247040000000804,0.32483666666666977,0.3249795833333337,0.3251251250000981,0.3252552083333285,0.32540241666671743,0.3255381250000937,0.32567383333334876,0.32581883333344497,0.32595291666669557,0.326097125000039,0.3262312083334109,0.32636995833333154,0.3265081666667053,0.3266490416666784,0.32678454166671145,0.3269280000000435,0.3270698750001126,0.3272074583333354,0.32733950000001644,0.3274848333334376,0.3276210833333607,0.3277637500000613,0.3278976666667101,0.3280453750000258,0.32817283333339825,0.32831720833334355,0.32845716666670344,0.3285982500000197,0.3287362916666704,0.3288685416666946,0.32901616666677,0.32915012500003893,0.3292898750000556,0.32943487500003055,0.3295633749999979,0.3297105833333868,0.329851625000083,0.329989041666704,0.3301275833334027,0.33026975000005526,0.3303960416667299,0.3305466250001094,0.33067820833336253,0.33082129166674956,0.3309576250000343,0.331096541666678,0.33122000000003027,0.3313593333333605,0.33150754166672414,0.3316440000001118,0.3317760833334129,0.3319167500000428,0.3320635833333654,0.33219320833341043,0.3323353333334429,0.332478291666727,0.33260829166671707,0.33274966666673816,0.3328900000000431,0.3330289166666868,0.3331663750000492,0.3333101666667062,0.3334495416667778,0.3335831250001017,0.333730083333406,0.33386683333337713,0.33400275000009666,0.33414870833342625,0.3342827500000567,0.3344239583333547,0.33455612500001736,0.33470150000005866,0.334841750000002,0.3349773750000168,0.33512225000001006,0.335256500000105,0.3353953750000073,0.33553812500006946,0.33567558333343184,0.3358070416667033,0.3359502083333306,0.3360857500001051,0.33622679166667996,0.3363685416667674,0.336506916666743,0.33664575000002517,0.33678287500006265,0.33692083333335177,0.3370641666667022,0.3372062916667346,0.3373397083333354,0.3374817500000063,0.3376148333334034,0.3377526666667109,0.33790545833338304,0.338036625000071,0.3381702916667564,0.3383103750000979,0.33845037500007796,0.3385872916667722,0.33872604166669285,0.3388743750000382,0.3390038750001016,0.33915104166674914,0.339292208333427,0.339421333333424,0.3395623749999989,0.339706833333427,0.339840458333371,0.3399840000000646,0.3401202083333677,0.3402615000000272,0.3403999166667442,0.3405405000000125,0.3406778333333932,0.3408196250001007,0.34094816666668826,0.34110329166675607,0.34123258333335493,0.3413760000000669,0.34151204166676813,0.3416654583333487,0.3417867916667698,0.3419321250000697,0.3420708333333702,0.3422045000000556,0.34234762500006277,0.34248104166666354,0.3426237916667257,0.34276350000000094,0.34289733333340944,0.3430489166667636,0.3431739999999991,0.34332208333338105,0.3434519583333895,0.3435946250000901,0.3437385833333489,0.34387800000004065,0.3440162083334144,0.3441530000000057,0.3442956666667063,0.3444355000000845,0.3445708750000146,0.34471037500006785,0.3448491250001098,0.3449877500000487,0.34512191666666087,0.34526916666666996,0.345396708333404,0.3455511250000806,0.3456817500001004,0.3458202083334375,0.34596229166672854,0.3461010000000291,0.3462384166667713,0.34637341666675636,0.34651937500008595,0.3466562500000388,0.34679625000001885,0.3469336250000197,0.3470661250000073,0.34721575000003213,0.34735412500000773,0.3474874583333682,0.34762300000002144,0.3477686666667675,0.3478999583334371,0.3480483333334026,0.34818762500011263,0.34832379166667427,0.3484560833334399,0.34860375000001415,0.34874029166676335,0.3488841250000405,0.34901879166670063,0.3491575000000012,0.3493000416667201,0.34943729166673926,0.349579500000012,0.34971612500000143,0.34985237500004585,0.3499952500000897,0.35013420833335357,0.35026833333334556,0.35041045833337797,0.35054658333344074,0.35069225000006554,0.3508238333334399,0.35096387500004006,0.3511040416667432,0.3512442500000664,0.35138604166677395,0.351514666666723,0.35166433333336805,0.3517955833334175,0.3519433333333533,0.35207054166676244,0.352220291666769,0.35235904166668963,0.35249583333340223,0.3526316666667602,0.3527740000000146,0.35291537500003567,0.3530510000000504,0.3531937083333711,0.3533276250000199,0.35346108333336207,0.3536030000000513,0.35374841666671275,0.3538797916667439,0.3540274583334394,0.35416300000009265,0.35429995833340705,0.35444775000008427,0.3545797083334037,0.35472204166677934,0.3548610416666634,0.3550031666666958,0.3551420416667194,0.3552728750000824,0.3554215833333728,0.35555020833344314,0.35569258333343895,0.3558338750000985,0.3559666666666696,0.3561052083333683,0.35625170833336595,0.3563915833333643,0.3565309166666945,0.35666341666668205,0.3568055416667145,0.35694675000001247,0.35708416666675474,0.3572248333333846,0.3573659583334423,0.3574972500001119,0.35763308333334864,0.35777333333341327,0.35791675000000395,0.358054333333348,0.3582010000000688,0.3583352500000425,0.3584695000000162,0.3586108750000373,0.3587512500000836,0.3588876666667299,0.35903525000006387,0.3591648750001089,0.35930887500010916,0.35944866666674596,0.3595863333333303,0.3597248333334088,0.3598645416666841,0.36000508333333225,0.3601440416667174,0.36028100000003177,0.36041966666671216,0.3605589583334222,0.36070083333337,0.36083916666672544,0.3609802083334216,0.3611126666666678,0.36125254166666615,0.3613957083334147,0.3615338750000471,0.3616708333333615,0.3618075000000924,0.3619558750000579,0.3620902500000132,0.3622298750000482,0.36236679166674246,0.3625093750000815,0.362647375000112,0.36278841666668693,0.3629221666667339,0.36306191666675053,0.3632053750000826,0.36333862500008157,0.36348220833339534,0.3636229583333867,0.3637564166667289,0.3638978333333701,0.3640349583334076,0.3641742916667378,0.3643128750000566,0.36445387500001136,0.3645906250001038,0.3647285833333929,0.3648700833333957,0.365009458333346,0.3651472083334132,0.36528533333342544,0.3654246666667556,0.36556466666673565,0.36570208333335663,0.36583833333340104,0.3659719166667249,0.3661211666666835,0.3662555000000187,0.36639816666671926,0.3665367500000381,0.3666752916667368,0.3668133750000076,0.3669525833333561,0.3670978333334157,0.367236833333421,0.3673689166667221,0.36751066666668825,0.3676525416667573,0.3677929166666824,0.3679243333333337,0.36806362500004375,0.36820645833334614,0.36834012500003155,0.36848766666674543,0.3686257083333961,0.3687613333334108,0.3689006249999996,0.369042375000087,0.36918087500004426,0.36932116666672904,0.3694570416667072,0.3695980000000418,0.3697362500000357,0.36987595833343223,0.370006083333404,0.37015783333336005,0.3702890833334095,0.3704301666667258,0.3705736250000579,0.3707040833333546,0.3708450416666892,0.37098949999999603,0.3711280416666947,0.3712602083333574,0.3714067500000965,0.37154104166669033,0.3716824166667114,0.3718218750000233,0.3719593750000058,0.37210058333342505,0.3722377500000827,0.3723756666667517,0.37251875000001744,0.37265766666666117,0.3727898333334451,0.3729282083334207,0.37307729166677744,0.37320504166673346,0.3733525833334473,0.3734891666666954,0.37362770833339404,0.37377066666667813,0.3739057916667662,0.37404795833341875,0.3741839166667584,0.37432116666677756,0.3744603750000048,0.3745987083333603,0.3747382916667751,0.37487800000005034,0.375019833333378,0.3751529583333953,0.3752977916667684,0.3754298750000695,0.3755780416666918,0.3757106666666611,0.37584700000006704,0.3759954583333941,0.37612816666672494,0.37626929166666134,0.37640712500009005,0.3765496666666877,0.37668670833336365,0.3768264583333803,0.37696437500004926,0.3771051250000407,0.3772433750000346,0.37737791666671305,0.377526000000095,0.37766016666670715,0.37779866666666445,0.37794004166668554,0.3780765416666933,0.37821670833339643,0.37835708333344276,0.3784907916667483,0.37863758333332953,0.3787744583334037,0.3789130833333426,0.3790512083333548,0.3791902083333601,0.3793278333334456,0.37947029166668167,0.3796042083333305,0.3797436250000222,0.379886500000066,0.3800237916667053,0.38016383333342674,0.3802991666667367,0.38044470833337984,0.38057854166666705,0.38072308333333543,0.38085516666675784,0.38100187500009874,0.3811321250000522,0.38127691666668395,0.38141525000003945,0.38154708333337717,0.38168720833333886,0.3818278333333486,0.3819660000001022,0.38211066666675225,0.38225012500006417,0.3823873333333419,0.3825247083333428,0.38266362500010775,0.3827997916666694,0.3829427083333333,0.38308437500005915,0.38321800000000317,0.3833553333333839,0.3834991250000409,0.38363841666675097,0.3837827916666962,0.3839155833333886,0.38406091666668846,0.3841936666667607,0.3843310833333817,0.3844737083333409,0.3846077916667127,0.38475545833340824,0.38489112500004313,0.38502820833333923,0.3851675000000493,0.38530683333337945,0.3854414583334195,0.38558675000009923,0.3857229166667821,0.3858633333334486,0.38600262500003735,0.3861353750001096,0.38627483333342144,0.38641616666670114,0.38655916666672663,0.38670029166666303,0.38683679166667084,0.3869710416667658,0.38711754166676354,0.38724866666671004,0.3873916666667355,0.3875293750000613,0.3876690000000963,0.3878080833333418,0.3879456666666859,0.3880867500000022,0.3882274166667533,0.38836616666667395,0.38850366666677777,0.38863787500001007,0.388780791666674,0.38892154166666537,0.38905941666671423,0.3891985833334426,0.38933629166676836,0.3894785000000411,0.3896155833333372,0.38975904166666925,0.389893083333421,0.39003120833343324,0.3901717916667015,0.39031295833337937,0.39044795833336443,0.390590125000017,0.39072587500001343,0.3908653333334466,0.3910085833334354,0.3911412500000248,0.39128158333332974,0.39142437500001204,0.39156062500005645,0.39169900000003205,0.3918397083334033,0.3919820833333991,0.39211700000002264,0.39225829166668214,0.39239279166674046,0.39253958333344297,0.39267183333334593,0.39281091666671275,0.39294891666674325,0.39309258333341857,0.39323225000007367,0.39336666666677045,0.39350466666667977,0.3936475000001034,0.39379041666676734,0.39392691666677515,0.3940613750000921,0.3942084583333781,0.39434174999999716,0.39448445833343915,0.39461995833335095,0.3947575833334364,0.3949019583333817,0.39503137500008356,0.39517533333334237,0.39531591666673194,0.3954545000000508,0.3955941666667059,0.3957320000000133,0.39587050000009183,0.3960141666667672,0.3961494166667156,0.39628729166676446,0.3964260833334265,0.39656041666676173,0.3967061666667481,0.3968445000001035,0.39698483333340845,0.39711462500005534,0.397267833333414,0.3973995833333902,0.39753208333337775,0.39767808333344873,0.3978156250000514,0.39795754166674063,0.3980972500000159,0.3982372083333757,0.39837037500001315,0.3985100000000481,0.39864970833344465,0.3987932916667584,0.3989305833333977,0.3990692500000781,0.3992060416666694,0.39934050000010757,0.39948029166674437,0.3996230416666852,0.3997636250000748,0.39990025000006424,0.4000432916667099,0.4001836250000148,0.40032108333337724,0.400460875000014,0.40059670833337196,0.40073654166675016,0.4008754166667738,0.40101258333343137,0.4011493750000227,0.4012897083333276,0.40143174999999853,0.40157012500009537,0.4017078750000413,0.4018531250001009,0.4019875416666764,0.40212554166670694,0.40227191666672296,0.40240687500008787,0.4025419166666931,0.40268833333332926,0.4028197083333604,0.40296116666674303,0.4031018750001143,0.40324116666670307,0.40338100000008126,0.4035139166667553,0.4036518333334243,0.40379662500005603,0.4039347916666884,0.4040713333334376,0.4042119166667059,0.40435166666672256,0.4044935000000502,0.4046318333334057,0.40476970833333326,0.40490591666675757,0.40504562500003277,0.4051862500000425,0.4053252083334276,0.40546179166667573,0.4056005416667176,0.40574125000008887,0.40588154166677365,0.4060184166667265,0.4061582500001047,0.40629637499999566,0.40643450000000786,0.4065749583334158,0.40671525000010056,0.40685241666675814,0.4069947083333924,0.40713229166673653,0.4072681250000945,0.4074062500001067,0.40754987500004064,0.40768162500001687,0.4078232500000013,0.4079664166667499,0.4081045000000207,0.4082425833334128,0.4083848333334269,0.40852041666670025,0.4086611666666916,0.4087989999999991,0.4089429583333792,0.40907512500004184,0.40922383333333223,0.4093559583333748,0.4094904583334331,0.40963737499999603,0.4097727083334272,0.4099143333334117,0.4100487916667286,0.41018420833340014,0.4103315416667707,0.4104697500000232,0.41060766666669224,0.41074645833335427,0.4108842500000416,0.4110236250001132,0.4111598333334162,0.4113048333333912,0.41143983333337625,0.4115798333333563,0.4117190833334462,0.4118549583334243,0.41199595833337904,0.4121448750000127,0.4122752083333277,0.4124128333334132,0.4125525000000683,0.41269191666676003,0.412826750000022,0.4129681250000431,0.41311062500002055,0.4132489166667559,0.4133880000000014,0.41352758333341627,0.413662208333335,0.41380725000005136,0.413944416666709,0.414077666666708,0.4142233333333328,0.41435879166674566,0.4145029166667276,0.41463979166668047,0.414756750000015,0.4149040416667655,0.4150387500000458,0.41518583333333176,0.4153158750000633,0.4154554166667367,0.41559620833334826,0.4157354166666967,0.4158725000001141,0.41601337500008717,0.41614995833333523,0.4162925833334157,0.4164351250000133,0.4165708333333896,0.4167084166667337,0.41685083333334966,0.4169934583334301,0.4171234583334202,0.41726400000006836,0.4174062916667026,0.4175427500000903,0.41768833333335353,0.41781841666670516,0.41795729166672874,0.41809866666674983,0.41823533333335944,0.41837641666667574,0.4185132916667499,0.41866433333343595,0.4187989166667345,0.4189397916667076,0.4190726666667615,0.41921429166674595,0.4193471666666786,0.41949666666672175,0.4196333333333314,0.4197642083334358,0.4199035000000246,0.42004737500004313,0.42018470833342386,0.4203240416667541,0.42046433333343886,0.42059829166670776,0.420745583333337,0.42088525000011334,0.42101487500003715,0.4211640416667554,0.42129337500009567,0.42144108333341135,0.4215792083334236,0.42171566666668997,0.4218509583333798,0.421989083333392,0.4221275833333493,0.42226666666671614,0.4224058333334445,0.42254487500006993,0.4226885833333654,0.42282770833335237,0.42296091666673113,0.42311041666677435,0.4232490416667133,0.42339070833343917,0.4235172916666973,0.42365812500005023,0.42380237500001383,0.42393712500003555,0.4240833750000699,0.4242187916667414,0.42435962500009433,0.42449420833339296,0.424631291666689,0.4247775000001032,0.4249139583333696,0.4250525833334298,0.4251867916666621,0.4253307916666624,0.4254620416667118,0.42561337500010266,0.42574162500010665,0.42588295833338635,0.4260197083333575,0.42616604166675337,0.42630545833344513,0.4264452083333405,0.42658637500001834,0.4267237916667606,0.4268535833334075,0.4269998333334418,0.4271376250000079,0.4272789583334088,0.42740933333334397,0.427557416666726,0.4276900416666952,0.4278350416666702,0.427974125000037,0.42811300000006064,0.42824812500002735,0.42838275000006737,0.4285280000000057,0.42866041666675303,0.42880779166674377,0.42894545833332814,0.4290771666666842,0.42922295833341195,0.4293666666667074,0.42949816666672025,0.429640875000041,0.4297807083334192,0.42992304166667356,0.4300598750000063,0.4301973333333687,0.43034029166677407,0.4304679583333685,0.4306177499999952,0.4307566666667602,0.43089083333337236,0.4310359166667089,0.43117420833344416,0.43130833333343616,0.43145029166674553,0.4315802499999942,0.4317299583333806,0.43186654166675,0.43200600000006184,0.4321434166666828,0.4322841250000541,0.4324210833333685,0.4325662916666867,0.43270075000000363,0.4328347916667553,0.43297320833335107,0.43311433333340876,0.43325504166678,0.43339225000005777,0.4335344583333305,0.4336768333334476,0.4338097500000003,0.43395579166669146,0.43409133333334465,0.4342223750000509,0.4343701666667281,0.4344984166667321,0.4346435833334302,0.43479183333341404,0.43491550000010953,0.4350585000000137,0.43520025000010115,0.4353358749999946,0.43548262500007695,0.43562133333337744,0.4357599166666963,0.4359002500000012,0.4360377083333636,0.4361764583334055,0.4363166250001086,0.4364532500000981,0.43658995833332787,0.43673437500001455,0.4368625416667783,0.43701045833343716,0.4371439583333995,0.4372924166667265,0.4374277916667779,0.4375673333333301,0.43770212500009315,0.4378435416667344,0.43798633333341663,0.4381263750000168,0.4382587500000227,0.4383970833333782,0.4385390833334289,0.4386745833333407,0.43881675000011455,0.43895766666670777,0.439086125000055,0.4392339166667322,0.4393751250000302,0.43951012500001524,0.43965650000003126,0.4397843333333488,0.4399304583334015,0.44006900000010013,0.4402092083334234,0.44034783333336236,0.44048608333335626,0.440625500000048,0.44076487499999834,0.44089912500009326,0.4410432500000752,0.4411811250000028,0.4413174583334088,0.4414572916666657,0.4415972500000256,0.4417377500000536,0.4418803333333926,0.44201416666667986,0.44215187500000563,0.4422916250000223,0.4424324166667551,0.4425712083334171,0.44270841666669486,0.44284725000009834,0.44298108333338554,0.4431268333333719,0.443262333333405,0.44340533333343046,0.44354533333341045,0.4436800416666908,0.4438241666666727,0.4439644166667373,0.44409966666668577,0.44424233333338636,0.4443834166667026,0.4445198750000903,0.444656708333423,0.4447954166667235,0.4449346666666922,0.4450747500000337,0.44520491666674694,0.44535000000008346,0.44548395833335236,0.4456287500001054,0.44576733333342416,0.4459063750000496,0.44604916666673183,0.4461831666667422,0.44632345833342696,0.4464684166667818,0.4465987500000968,0.44673987500003326,0.44688275000007704,0.4470194583334281,0.44715937500004654,0.4472963750001024,0.44744112500011396,0.44757737500003714,0.4477145416666948,0.4478517916667139,0.44799004166670786,0.44812750000007023,0.4482697916667045,0.4484109166667622,0.44854891666667146,0.4486861250000705,0.4488260833334304,0.44896554166674224,0.44910770833339486,0.4492350833334058,0.44938070833341043,0.44951850000009774,0.44965658333336855,0.4498020416667714,0.44994175000004666,0.45008216666671313,0.4502224583333979,0.45035150000003343,0.45049887500002417,0.45062583333334866,0.4507747500001036,0.45091387500009056,0.4510487500000939,0.45119020833335527,0.4513290416667587,0.4514699583333519,0.45161154166671624,0.451747541666676,0.4518832500000523,0.4520235416667371,0.45216666666674427,0.45230375000004036,0.4524446250000134,0.4525806250000945,0.45271833333342026,0.4528585416667435,0.4529991666667532,0.45313625000004926,0.4532761250000476,0.45341254166669387,0.45354920833342477,0.45368775000000217,0.4538262083333393,0.45397020833333956,0.4541152500000559,0.4542496666667527,0.45438654166670556,0.4545258333334156,0.4546708333333906,0.45480475000003934,0.45494220833340177,0.4550848750001023,0.455225708333334,0.4553657500000554,0.45549650000005687,0.4556393333333593,0.45577575000000553,0.4559143333334456,0.4560548333333524,0.4561927500000214,0.4563330833334476,0.45647425000000413,0.45660875000006246,0.45674712500003806,0.4568925416666995,0.4570276250000461,0.45716912500004886,0.45730079166666354,0.4574396666666871,0.4575849166667467,0.4577247500000036,0.4578661666667661,0.45799758333341745,0.45814325000004225,0.45827879166669544,0.4584192500001033,0.45855895833337856,0.4586997083333699,0.4588351250000414,0.45897816666668706,0.45911354166673846,0.4592556250000295,0.45939733333337546,0.45953129166676565,0.4596678750000137,0.45980604166676736,0.4599533750000167,0.4600867499999974,0.4602230000000418,0.4603685416666849,0.46050037500002267,0.46064220833335034,0.4607872500000667,0.4609226666667382,0.46106137500003874,0.4612028750000415,0.46133700000003347,0.4614781666667113,0.46161804166670967,0.46175858333335784,0.46189225000004325,0.4620349166667438,0.4621734166667011,0.46230841666668615,0.46245212500010285,0.4625899583334103,0.4627260833333518,0.4628700416667319,0.4630015833333649,0.4631508333334447,0.4632795416667553,0.46342654166667974,0.46356179166674943,0.4637020833334342,0.4638437500000388,0.46397891666674695,0.46411975000009986,0.4642620416667341,0.46439525000011295,0.46454258333336235,0.46467954166667674,0.4648180416667553,0.46495216666674727,0.46509366666675,0.46522779166674205,0.4653725833333738,0.4655065000000225,0.4656470416666707,0.46578854166667344,0.4659259166666743,0.4660599166666846,0.4662041666667695,0.46634304166667184,0.4664860416666973,0.4666223750001033,0.46676304166673316,0.46690220833334023,0.4670375000000301,0.46717479166666936,0.46731733333338826,0.467460041666709,0.46759408333333946,0.46773583333342683,0.46787612500011166,0.46801354166673265,0.46814895833340414,0.4682944166666857,0.46842937500005066,0.46857037500000537,0.4687040833334322,0.46884729166667966,0.4689892916667304,0.4691246250000404,0.469264000000112,0.46940412500007367,0.46954250000004927,0.4696823750000476,0.4698204583334397,0.4699625833333509,0.47009875000003376,0.4702331250001104,0.4703721666667358,0.47051125000010263,0.47065075000003465,0.47078904166677,0.4709292500000932,0.471072833333407,0.4712095000000166,0.47135095833339924,0.47148762500000885,0.4716257916667625,0.47176683333333735,0.4719034583334481,0.4720406666667259,0.47218308333334186,0.47231920833340457,0.47246120833333405,0.472598750000058,0.47273800000002664,0.47287662500008687,0.47302000000005745,0.47315412500004944,0.4732970416667134,0.4734352500000872,0.47356900000001284,0.473711750000075,0.47385104166666375,0.47398912500005586,0.4741255833334435,0.4742697083334254,0.47440533333344015,0.47454095833333365,0.47468479166673205,0.4748226666667809,0.47496112499999676,0.4750998750000387,0.47524075000001176,0.4753787916666624,0.4755198333333586,0.47565591666667995,0.4757974166666827,0.4759301666667549,0.47607579166675956,0.47620891666677684,0.4763495000000451,0.4764861250000346,0.4766342916667782,0.47676854166675187,0.4769050833333798,0.47704450000007154,0.47718720833339223,0.477324916666718,0.47746833333343,0.4775988750000882,0.47774116666672245,0.47788208333343696,0.4780135833333285,0.47816487500009924,0.47829316666672334,0.47843966666672105,0.47857787500009485,0.47871183333336376,0.47885354166670974,0.47899433333344255,0.47912929166668616,0.4792641666666896,0.47941637500007345,0.4795523750000333,0.47969370833343417,0.47982466666677887,0.47996679166669004,0.48010129166674836,0.48024020833339215,0.4803809583333835,0.48051954166670235,0.48067125000003824,0.4808021666667628,0.48093945833340207,0.48107670833342125,0.4812215833334145,0.4813559583333699,0.48149033333344654,0.48163695833342596,0.48178145833335295,0.48191500000005666,0.4820474583334241,0.4821845833333403,0.48233400000002197,0.4824675000001056,0.4826099166667215,0.4827485000000403,0.4828867500000342,0.4830293333333733,0.4831594166667249,0.48330329166674346,0.48343812500000544,0.48358004166669466,0.48372133333335415,0.48386208333334557,0.4839995833333281,0.48414433333333967,0.48427700000005036,0.48441091666669917,0.48455850000003314,0.484690000000046,0.484838083333428,0.4849644583333429,0.4851132499999949,0.48524741666672827,0.48539320833333477,0.485525458333359,0.48566729166668665,0.4858010416667336,0.48594966666666245,0.48609104166668354,0.4862292083334372,0.4863681666667011,0.4864993750000091,0.4866355000000719,0.48678154166676296,0.48691616666668175,0.48705600000005994,0.48720054166672827,0.4873341666666723,0.48747362500010544,0.48761554166667337,0.48775437500007685,0.4878902500000549,0.4880260416666715,0.488168166666704,0.48831275000011376,0.48845050000005963,0.4885869166667059,0.4887310000000677,0.4888596666667581,0.488998625000022,0.4891447500000747,0.4892837083333385,0.48941816666677673,0.4895567500000955,0.489697875000032,0.4898360833334057,0.4899761666667473,0.4901143749999998,0.49026079166675723,0.49039958333341926,0.49052583333335253,0.4906773750000866,0.49080770833340165,0.490949166666663,0.4910885833333547,0.49122545833342884,0.4913685416666946,0.49150179166669355,0.49164808333334803,0.49178229166670157,0.4919216250000318,0.4920704166666837,0.4922039166667673,0.4923406249999971,0.4924815833333317,0.4926215416666916,0.49275629166671325,0.49289995833338857,0.4930332916667491,0.49316987499999715,0.49331354166667246,0.4934454166667516,0.4935955416667033,0.4937280000000707,0.4938712916666797,0.494003208333379,0.4941495416667749,0.4942880416667322,0.494425416666733,0.4945627916667339,0.4947064583334092,0.49484191666670085,0.49497875000003355,0.4951286666667632,0.49525766666677856,0.4953998333334312,0.49553904166677964,0.4956825416667319,0.4958137083334198,0.4959590833333399,0.4960961666667572,0.49623108333338073,0.4963725416667633,0.4965166250000038,0.49665166666673033,0.49679362500003965,0.4969217916666821,0.4970621666667284,0.4972041250000378,0.49734708333344313,0.49748816666675943,0.4976237500000328,0.49775587500007534,0.4978975833334213,0.4980383333334127,0.4981761250001,0.498304375000104,0.49844666666673826,0.49859133333338834,0.49872250000007623,0.4988587916667408,0.4990015833334231,0.49913858333335764,0.49927641666666506,0.49941637500002495,0.4995510833334265,0.4996929166667542,0.49983666666666976,0.49996679166676283,0.5001108333333832,0.500252708333331,0.500387333333371,0.5005372500001006,0.5006668333334043,0.5008122916666858,0.5009477083333574,0.5010876666667172,0.5012296250000267,0.5013680416667436,0.5014978750000106,0.5016436249999969,0.5017760416667443,0.5019209166667375,0.502060458333411,0.5021996666667595,0.5023323333333489,0.5024729583333586,0.5026154583333361,0.5027577083333502,0.5028884583333517,0.5030303750000409,0.5031782083333383,0.5033075000000584,0.5034523333334315,0.5035856666666708,0.5037247500000376,0.50386687500007,0.5040071250000134,0.5041493333334074,0.5042757083334436,0.5044246666666974,0.5045620000000781,0.504696291666672,0.5048346250000274,0.5049755000000005,0.505115708333445,0.5052551250000155,0.5053896666666939,0.5055320833334311,0.5056768750000629,0.5058071250000163,0.5059540833334419,0.5060926250000193,0.5062317916667477,0.5063712083334394,0.5065079166666692,0.506649083333347,0.506785791666698,0.5069202916667563,0.5070580833334437,0.5072080833334136,0.5073355833334062,0.5074887083334033,0.507617458333334,0.5077545416667514,0.5078902916667478,0.5080320833333342,0.508179625000048,0.5083187916667763,0.5084531666667317,0.5085882500000783,0.5087278333333719,0.5088788333334378,0.5090104583334323,0.5091498333333827,0.5092903333334107,0.5094207500000872,0.5095720833333568,0.5096990833334227,0.5098482500000198,0.5099882083333795,0.5101293333334372,0.510259791666734,0.5103953333333872,0.5105385416667559,0.5106825416667562,0.5108176666667229,0.510956458333385,0.5110948333333606,0.5112302500000321,0.5113671250001062,0.5115210833333549,0.511651583333393,0.5117901666667118,0.5119293333334402,0.5120656250001048,0.5122040833334419,0.5123472916666894,0.5124883333333855,0.5126242083333636,0.512763208333369,0.5128970833333976,0.5130361250000229,0.5131849583334164,0.513321291666701,0.5134551666667296,0.5136005000000295,0.5137377916666689,0.513872958333377,0.5140165416666908,0.5141548750000463,0.5142918750001021,0.5144266250000025,0.5145730000000185,0.5147153333333941,0.5148521666667268,0.5149883333334098,0.5151233750000149,0.5152617083333705,0.5154047083333959,0.5155432500000946,0.5156789583333496,0.51581691666676,0.5159625833333848,0.5160933333333863,0.5162314166667784,0.5163786666666662,0.5165122500001114,0.5166566250000566,0.5168000833333887,0.5169332500000261,0.5170677916667046,0.5172125833333363,0.5173554583333801,0.5174933750000491,0.5176318750000064,0.5177721666666912,0.5179020000000795,0.5180408333333617,0.5181890000001051,0.5183282083333325,0.5184610000000248,0.5186014166666912,0.5187384583333672,0.5188755833334047,0.519027541666704,0.5191581250001036,0.5192951666667796,0.5194369166667456,0.5195697083334381,0.5197101250001045,0.5198607500001041,0.5199914166667441,0.5201310833333992,0.5202649583334278,0.5204035416667466,0.5205493333333531,0.5206807500000044,0.5208290000001095,0.5209639583333531,0.5211066250000537,0.5212491250000312,0.5213795416667077,0.5215285416667029,0.5216664166667518,0.5217960000000554,0.5219443333334008,0.5220722916667,0.5222257083334019,0.5223563333334217,0.5224962500000402,0.5226310833334235,0.5227755833333504,0.5229103750001135,0.523060666666667,0.5231925000000046,0.5233279583334176,0.5234658750000866,0.5236078333333959,0.5237517083334144,0.5238844166667452,0.5240317083333745,0.524162625000099,0.5243055833333832,0.5244429583333841,0.5245811666667578,0.5247276666667555,0.5248638750000585,0.5250015000000228,0.5251287083334318,0.525271333333391,0.5254185416667799,0.525557666666767,0.5256925833333904,0.5258315833333957,0.5259722083334054,0.5261104166667792,0.5262503750000178,0.5263897500000894,0.5265275000000353,0.526667624999997,0.5268070416666888,0.5269448749999962,0.5270805000000109,0.5272290000000794,0.5273574166666852,0.5275007500000356,0.5276399583333842,0.5277803333334304,0.5279116666667202,0.5280610000000403,0.5281919166667649,0.5283316250000402,0.5284737083333312,0.5286045833334356,0.528752791666678,0.5288856250001117,0.5290240833333276,0.529172541666776,0.5293110000001131,0.5294448333334003,0.5295869166666913,0.5297267083333281,0.5298625416666861,0.5300025833334076,0.5301457500000348,0.5302775833333726,0.5304275833333425,0.5305620833334008,0.5307000000000699,0.530835166666778,0.5309787500000918,0.5311177500000971,0.5312609166667244,0.5313937500000369,0.53152929166669,0.5316690416667067,0.5318120833333524,0.5319566666667621,0.5320882083333951,0.5322233750001033,0.5323717916666889,0.532502291666727,0.532644000000073,0.5327860000000025,0.5329145416667113,0.5330653750000541,0.5332007916667256,0.5333427916667763,0.5334744166667709,0.5336225833333932,0.5337612916666937,0.5338929583334296,0.5340347916667573,0.5341739166667442,0.5343157500000719,0.5344480000000961,0.5345934166667575,0.5347258333333836,0.5348730000000311,0.5350079583333961,0.5351489166667307,0.5352860000000267,0.5354232083334257,0.5355647083334285,0.5357086250000672,0.5358434583333291,0.5359832500000873,0.5361222083333511,0.5362583333334139,0.5364007083334097,0.5365350000000035,0.5366702083333318,0.5368198750000981,0.5369489583333537,0.5370876666667754,0.5372333333334003,0.5373771250000573,0.5375103333334361,0.5376552916666697,0.5377887083333917,0.5379311250000076,0.5380699583334111,0.5382028750000851,0.5383449999999963,0.5384876666666969,0.5386195416667761,0.5387672916667119,0.5388961666667456,0.5390390833334096,0.5391797916667808,0.5393186250000629,0.5394602083334272,0.5395979583333731,0.5397310000000288,0.5398687916667162,0.5400183333333796,0.5401513750000352,0.5402900416667156,0.5404264583333619,0.5405748333334486,0.5407070416667314,0.5408474583333979,0.5409840833333874,0.5411198333333839,0.5412637916667639,0.5413989166667307,0.5415397083333422,0.5416802500001116,0.5418204166666934,0.541960500000035,0.542097208333386,0.5422351666666752,0.5423739583333372,0.5425170000001042,0.5426525000000159,0.542791791666726,0.5429342083333419,0.5430704166667663,0.5432089583333436,0.5433500416667811,0.5434900000000198,0.5436237500000668,0.5437702500000644,0.5439049166667246,0.544052916666745,0.5441820000000007,0.5443226666667518,0.5444620833334436,0.5445985000000898,0.5447382916667266,0.5448791250000795,0.545016458333339,0.5451520833333537,0.5452908750000157,0.5454302500000874,0.5455730833333897,0.545713791666761,0.5458518333334117,0.5459930833333299,0.5461304166667105,0.5462654166666956,0.5464080000000346,0.5465529166667693,0.5466908333334383,0.5468298333334436,0.546959583333349,0.5471043333333606,0.5472385000000941,0.5473811666666734,0.5475185833334156,0.5476604166667433,0.5477995000001101,0.5479392083333854,0.5480799583333767,0.5482145833334168,0.5483565000001059,0.5484976250000424,0.5486332916666773,0.5487734583333804,0.5489124166667655,0.549051125000066,0.5491851250000763,0.5493270000000242,0.5494599166666982,0.5496005416667079,0.5497427083333605,0.5498821666666723,0.5500271250000272,0.5501637083333966,0.5503010000000359,0.5504364583334488,0.5505782916667764,0.5507144166667179,0.5508565833333705,0.5509950833333278,0.5511355833333558,0.551274541666741,0.5514141666667759,0.551552958333438,0.5516928750000564,0.5518325416667115,0.5519688333333761,0.5521076666667796,0.5522479166667229,0.5523848333334171,0.5525276250000994,0.5526603750000504,0.5528047083333756,0.5529378333333929,0.5530780833333362,0.5532202083333686,0.5533637500000623,0.5534949583333704,0.553636791666698,0.5537766250000762,0.5539138750000954,0.5540581666666792,0.554193125000044,0.5543333333333673,0.5544755833333814,0.5546153333333981,0.5547510833333945,0.5548900000000382,0.5550334583333704,0.5551670833334356,0.5553064166667657,0.5554456250001143,0.5555838333333668,0.5557195000000017,0.555861958333359,0.5559995833334445,0.5561392916667197,0.556282916666775,0.5564185833334098,0.5565559166666693,0.5566940833334229,0.5568418333333587,0.5569759583333507,0.5571150416667175,0.557250791666714,0.5573893333334127,0.5575290000000678,0.5576677083333682,0.5578060833333438,0.557952125000035,0.5580903750000289,0.5582298750000821,0.5583617500000401,0.5585057916667817,0.5586406250000436,0.5587824166667512,0.5589212916667747,0.5590525833334444,0.5591995833333688,0.5593377500000012,0.5594772083334344,0.559614750000037,0.5597571250000328,0.5598973750000975,0.5600318750000345,0.5601683333334222,0.5603087083333472,0.5604490833333936,0.5605876250000923,0.5607264583333744,0.5608650000000731,0.5610063750000942,0.5611494583333599,0.5612818333333659,0.561423583333332,0.5615580416667701,0.5617000000000796,0.5618414583333409,0.5619742083334132,0.562114374999995,0.5622578333334484,0.5624052083334391,0.5625338333333881,0.5626748333333429,0.5628135000000233,0.5629490000000563,0.5630938750000496,0.5632272500000303,0.5633646666667725,0.56351183333342,0.5636520000000018,0.5637823333334382,0.5639265833334017,0.5640614166666638,0.564201416666765,0.5643444166666692,0.5644846250001138,0.5646230416667095,0.5647587500000858,0.5648973750000247,0.5650332083333827,0.5651782916667192,0.5653159583334249,0.565448916666719,0.5655903750001017,0.5657269166667296,0.5658717083333613,0.5660045416666738,0.566143875000004,0.5662836250000206,0.5664254166667282,0.5665657500000331,0.5667087916666788,0.5668430833333938,0.5669859166666963,0.5671213333333678,0.5672575000000506,0.5674077083333638,0.5675383750000037,0.567675291666698,0.5678217500000755,0.5679593333334196,0.568092875000002,0.5682420833333405,0.5683712500000789,0.5685137916666766,0.5686546250000295,0.5687935416666733,0.5689295416667544,0.5690669999999954,0.5692014583334336,0.5693440833333928,0.5694837500000479,0.5696231666667396,0.5697653333333922,0.569899250000041,0.5700427083333731,0.5701800000000125,0.5703190833333792,0.5704541250001057,0.5705950833334403,0.5707399583334336,0.5708733333334143,0.5710137916667009,0.5711568333333464,0.5712960833334364,0.5714359166666934,0.5715705833333534,0.5717061250000067,0.5718422916666895,0.5719907500000166,0.5721258750001046,0.5722670833334026,0.5724079583333757,0.5725430000001022,0.5726847083334481,0.5728284166667436,0.5729579166666857,0.5730989583333819,0.5732396666667531,0.5733798750000764,0.5735118750000159,0.5736559583333777,0.5737975000000006,0.5739328333334318,0.5740743333334346,0.5742102500000328,0.5743522083333422,0.5744848333334327,0.5746234166667515,0.5747671666666672,0.5749047500000112,0.5750473750000916,0.5751843750000262,0.5753262083333539,0.5754649583333957,0.5756032500000098,0.5757433750000928,0.5758795833333958,0.5760193333334125,0.5761632916666712,0.5762969166667365,0.5764356250000371,0.5765760000000834,0.5767152916666721,0.5768464583333601,0.5769975000000461,0.5771320000001045,0.5772720416667046,0.5774077083333395,0.5775480416667658,0.5776908750000681,0.5778262083333782,0.5779668333333878,0.578103250000034,0.5782451250001032,0.5783832916667355,0.5785259583334361,0.5786537083333921,0.5788018333333942,0.5789391666667749,0.5790743750001032,0.5792206250000163,0.5793627500000488,0.5794945416667664,0.579631541666701,0.5797703333333629,0.5799104166667045,0.5800557916667458,0.5801886666666785,0.5803283333333336,0.5804673333333388,0.5806073750000602,0.5807444583333563,0.5808871250000569,0.5810278750000483,0.581163500000063,0.5813000833334324,0.5814354166667424,0.5815779583333399,0.5817188750000545,0.5818412500000705,0.5819915000000038,0.5821205833333807,0.5822656666667172,0.5823977500000183,0.5825377499999983,0.5826849583333872,0.5828123333333982,0.5829505000000306,0.5830931666667312,0.5832307500000752,0.5833720416667347,0.5835188333334372,0.5836531666667725,0.5837975833333379,0.5839352083334234,0.5840658750000632,0.5842081250000775,0.5843520416667161,0.584491500000028,0.5846231250000226,0.5847639583333755,0.5849069583334009,0.5850456666667014,0.5851808750000297,0.5853176250000008,0.5854661250000693,0.5855965000000045,0.5857362500000212,0.5858806666667078,0.5860193333333882,0.586148250000042,0.5862974583333804,0.5864309166667226,0.5865711250000458,0.5867153750000095,0.5868506666666993,0.5869917083333954,0.587120916666754,0.5872642916667246,0.5874100000000908,0.5875463749999956,0.5876889583333347,0.5878275833333949,0.5879590000000462,0.5881062083334352,0.5882425000000997,0.5883815416667252,0.5885138333333695,0.5886612500001017,0.5887983750000179,0.5889324583333898,0.5890799583333622,0.5892175416667063,0.5893479166667627,0.5894918333334014,0.5896375000000262,0.589772291666668,0.5899139166667737,0.5900490416667404,0.5901907083333451,0.5903305833333434,0.5904660416667563,0.5905984583333823,0.5907446666666752,0.5908881666667488,0.5910226666666858,0.5911540833333372,0.5913020416667375,0.5914355000000796,0.5915808749999997,0.591720541666776,0.5918534583333288,0.5919902083334212,0.5921357916666845,0.5922740416666784,0.5924156250000426,0.592553750000055,0.5926827916666905,0.592826166666661,0.5929695416667528,0.5931102500000027,0.5932485833333582,0.5933789166666732,0.5935292916667094,0.593657125000027,0.5937989166667346,0.5939412083333688,0.5940845416667192,0.5942247500000425,0.5943595416666843,0.59449258333334,0.5946358750000703,0.5947760833333935,0.5949077500000082,0.5950488333334457,0.5951925416667412,0.5953355416667667,0.5954746666667536,0.5956112916667432,0.5957430000000993,0.5958868333333763,0.596023625000089,0.5961697083334002,0.5963074583333461,0.5964488750001086,0.5965802916667599,0.5967270000001008,0.5968668750000992,0.5969994166667069,0.5971400416667165,0.5972824583333325,0.5974230833333423,0.5975577083333822,0.5976876250000108,0.5978377916667038,0.5979753750000479,0.5981139583333667,0.5982546249999966,0.5983870000000024,0.5985303750000942,0.59867275000009,0.5987995000000713,0.5989482083333617,0.599090125000051,0.5992301250000309,0.5993691666667776,0.5995034166667513,0.5996469166667036,0.5997802083334439,0.599926458333357,0.6000600833334223,0.6001975000000432,0.6003402916667255,0.6004692083333794,0.6006208333333537,0.6007547083333823,0.6008935833334059,0.6010298750000705,0.6011741666667755,0.6013081666666645,0.6014542083333557,0.601591666666718,0.6017258333333302,0.6018640833334454,0.602007125000091,0.6021475000000162,0.6022757083333999,0.6024155000000367,0.602564666666755,0.6026934583334271,0.602845166666763,0.6029795833333386,0.6031101249999968,0.6032572500000242,0.6033928750000389,0.6035339166667352,0.6036767500000375,0.6038100416667779,0.6039528333333389,0.6040916250000009,0.6042289166667615,0.6043736666667731,0.6045095416667512,0.6046477916667451,0.6047814583334306,0.6049259583333575,0.6050662083334222,0.6052035000000615,0.6053385416666667,0.6054810416667654,0.6056207500000407,0.6057540000000396,0.6059038750000278,0.6060341666667227,0.6061812916667502,0.6063182916666847,0.606456958333365,0.6065951666667388,0.6067245833334406,0.6068754166666622,0.6070083333333363,0.6071544166667687,0.6072880000000926,0.6074265833334115,0.6075653750000735,0.6077084166667192,0.6078452083334317,0.6079822916667278,0.6081201250000352,0.608259541666727,0.6083990000000389,0.6085398333333918,0.6086769583334293,0.608822958333379,0.6089561666667578,0.6090871250001025,0.6092361666667178,0.6093795000000682,0.6095137916666621,0.609653416666697,0.6097911250000227,0.6099272500000855,0.6100697916666832,0.6102142500001112,0.6103495416666799,0.6104832916667268,0.6106243750000431,0.6107615833334421,0.610904375000003,0.6110488750000513,0.6111801666667209,0.6113233333333483,0.611463083333365,0.6115987083333797,0.6117431250000663,0.6118759583333788,0.6120158749999973,0.6121504583334172,0.612285625000004,0.6124265416667185,0.6125732500000595,0.6127108333334036,0.6128536250000859,0.6129906250000203,0.613122791666683,0.61326658333334,0.6134022916667163,0.6135476250000163,0.6136823333334178,0.6138248750000154,0.6139638750000207,0.6141003333334083,0.6142392500000521,0.6143793333333937,0.614518708333344,0.6146543333333587,0.6147988750000271,0.6149350833333301,0.6150704583333815,0.6152088333333571,0.6153507083334262,0.6154882083334087,0.6156282083333887,0.6157712083334143,0.6159074583333374,0.6160490833334431,0.61618820833343,0.6163203333333513,0.6164607083333976,0.6166022083334004,0.616740916666701,0.616886083333399,0.6170178333333751,0.617159000000053,0.6172961666667106,0.6174354166666792,0.6175742916667029,0.6177159583334287,0.6178536250000131,0.6179932916666682,0.6181313750000602,0.6182703750000655,0.6184132500001094,0.6185456666667354,0.618692333333335,0.6188257916666771,0.6189652916667304,0.6191037916666876,0.6192455833333952,0.6193830833333778,0.6195204999999987,0.6196613333333516,0.6198050416667684,0.6199371666666896,0.6200794166667037,0.6202139583333822,0.6203570416667693,0.6204959166666716,0.6206311249999998,0.620773000000069,0.620911291666683,0.6210545000000517,0.6211881666667372,0.621330541666733,0.6214661250000063,0.6216068749999977,0.6217453750000762,0.6218847916667679,0.62202358333343,0.6221690000000915,0.6223011250000127,0.6224375000000388,0.6225816666667622,0.6227166666667472,0.6228582083333701,0.6229960416666775,0.6231370833333737,0.6232784166667746,0.6234125000000252,0.6235507500000191,0.623697958333408,0.6238330833333748,0.6239687500000097,0.6241147500000807,0.6242495416667225,0.6243883750000047,0.624524250000104,0.6246682083333629,0.6248019583334099,0.6249448750000738,0.6250858750000285,0.6252182916667759,0.625362499999998,0.6255012083334198,0.6256344583334188,0.6257742500000556,0.6259166250000514,0.6260582916667772,0.626198791666684,0.6263343333333372,0.6264695833334069,0.6266129583333774,0.6267457083333283,0.6268906250000631,0.6270270000000892,0.6271708333333663,0.627308541666692,0.6274458333333314,0.6275855416667279,0.6277280833334468,0.6278576250000091,0.6280034166667368,0.6281431666667534,0.6282753333334161,0.6284133333334466,0.6285586666667465,0.6287018750001152,0.6288339583334164,0.6289764166667737,0.6291123750001134,0.6292546666667477,0.6293943750000229,0.6295272500000768,0.6296746666666877,0.6298039583334079,0.6299488333334011,0.6300860000000588,0.6302253333333889,0.6303588750000927,0.6305057083334152,0.6306443750000956,0.6307810416667052,0.6309230416667561,0.631058708333391,0.6311981250000827,0.6313372916666897,0.6314763333334364,0.6316179583334208,0.6317606250000002,0.6318966666667014,0.6320364583333382,0.632176916666746,0.6323117083333879,0.6324526250001024,0.6325947916667549,0.6327309583334378,0.6328718333334109,0.6330136666667385,0.6331477916667306,0.6332830833334204,0.6334276666667089,0.6335630416667603,0.6337058750000627,0.6338399166666931,0.6339847916666864,0.6341203750000811,0.6342605416666629,0.6343955416667693,0.6345396666667511,0.6346768333334087,0.6348138750000847,0.6349574166667783,0.6350969583333305,0.6352319583334368,0.6353697083333827,0.6355095000000195,0.6356492500000361,0.6357876666667531,0.6359220833333287,0.6360581250000299,0.6362037500000345,0.6363430833333648,0.6364843333334042,0.636622958333343,0.6367567500000102,0.6368977083333448,0.6370403333334252,0.6371733333333396,0.6373166250000698,0.6374547083333406,0.6375880833334425,0.637732666666731,0.6378695416666839,0.6380101250000735,0.6381470833333879,0.6382888750000953,0.6384320833333429,0.6385686666667122,0.6387025416667408,0.6388495000000451,0.6389810833334195,0.639123916666722,0.6392584583334003,0.6394003750000896,0.6395399583333832,0.6396762916666678,0.6398153333334146,0.6399563333333693,0.6400985000000219,0.640237833333352,0.6403730416666804,0.6405130833334017,0.6406506666667459,0.6407888749999984,0.6409236666667615,0.6410710416667522,0.6412106250000458,0.6413467916667287,0.6414868750000703,0.641620624999996,0.6417704166667438,0.6418979166667366,0.6420426666667481,0.642176625000017,0.6423208333333605,0.6424552083334372,0.6425977500000347,0.6427360833333903,0.6428750833333955,0.6430221250000614,0.643151708333365,0.6432964999999967,0.6434307500000916,0.64357062500009,0.6437090833334271,0.643849375000112,0.6439936250000755,0.644136125000053,0.6442625000000892,0.6444047083333619,0.6445465416666897,0.6446770000001076,0.6448200833333734,0.6449653750000531,0.6450969583334275,0.6452400000000732,0.6453736250000172,0.6455150000000383,0.6456589583334184,0.6457907916667561,0.6459348333333764,0.6460820833333856,0.6462134583334167,0.6463494583333765,0.6464893333333748,0.6466361250000773,0.6467687083334265,0.6469063750000108,0.6470531250000932,0.6471904583333525,0.6473283333334015,0.6474587083333366,0.6475964166666623,0.6477354583334091,0.6478884583334245,0.6480187499999981,0.6481582500000513,0.6483004166667039,0.6484306666667786,0.6485784166667145,0.6487099583333474,0.6488481250001011,0.6489877916667562,0.6491292916667589,0.6492660416667301,0.6494037916666761,0.6495449583333539,0.6496859166666885,0.6498242083334238,0.6499627083333811,0.6501012083333383,0.6502424166667576,0.6503803750000468,0.6505180416667523,0.6506611666667595,0.6507983750000373,0.65093987500004,0.6510762500000662,0.65121520833333,0.6513502500000565,0.651502416666699,0.6516405833333313,0.6517720000001039,0.6519079166667022,0.6520542083333567,0.6521875416667171,0.6523372083333622,0.652469583333368,0.6526057083334308,0.6527543750001011,0.6528820833334369,0.6530197083334012,0.6531682500000897,0.6533072916667152,0.6534433750000365,0.6535796250000809,0.6537215833333903,0.6538585416667047,0.6540027500000481,0.6541360000000471,0.6542743333334026,0.6544128333333599,0.6545519166667266,0.6546992500000973,0.6548325000000962,0.6549772083333665,0.6551150000000537,0.6552488750000823,0.6553935416667325,0.6555277083333446,0.6556708750000931,0.655806875000053,0.6559436250000241,0.6560871250000976,0.6562218333333779,0.656361833333358,0.6564969583334459,0.6566375833333343,0.6567770416667675,0.6569191666666787,0.6570575000000342,0.6571974166667739,0.6573344583333286,0.657470333333428,0.657607791666669,0.6577525833334221,0.6578894166667548,0.6580305833334327,0.6581665833333924,0.6583045000000615,0.6584485000000616,0.6585885000000417,0.6587255416667176,0.6588639166666932,0.6589989166666783,0.6591381250000268,0.6592787083334163,0.6594176250000601,0.6595637500001127,0.6596953333333658,0.6598388333334394,0.6599772083334149,0.6601195416666693,0.6602531250001145,0.6603905833333557,0.6605310833333836,0.6606755416666904,0.6608107916667602,0.6609499166667471,0.6610883333333428,0.6612265833333367,0.6613680416667194,0.6615020000001095,0.6616535000001023,0.6617820833334311,0.6619217083333448,0.6620618333334278,0.6622015000000829,0.6623377083333859,0.6624783333333956,0.6626168333333529,0.6627555416667746,0.6628939166667502,0.663037500000064,0.6631719166667608,0.6633214583334242,0.6634496250000665,0.6635922083334056,0.6637295000000449,0.6638649583333366,0.6640099583334328,0.6641485416667516,0.6642812916667026,0.6644278750000618,0.6645693333334445,0.6647107083333442,0.6648398333333413,0.6649742500000381,0.6651197916666812,0.6652654166666859,0.6653852083333428,0.6655210000000806,0.6656639583333648,0.6657999166667045,0.6659383750000416,0.6660872500000551,0.6662157916667638,0.6663565416667552,0.6664939166667561,0.6666286250000364,0.6667804166667338,0.6669110833333737,0.6670584166667444,0.6671911250000752,0.6673293333333277,0.6674703333334037,0.6676054583333705,0.6677571666667064,0.6678830000000744,0.6680312916666783,0.6681630416667759,0.6683075833334442,0.6684387083333907,0.6685797083333455,0.6687194583333621,0.6688646666666803,0.6689952083333386,0.6691409583334462,0.6692786250000305,0.6694168750000244,0.6695517916667693,0.669691083333358,0.6698333333333721,0.6699705416667712,0.6701116666667076,0.6702522500000971,0.6703933750000336,0.6705303750000894,0.6706693750000947,0.6708080000000336,0.6709460000000642,0.671091333333364,0.6712185833333933,0.6713704583333311,0.671502125000067,0.6716413750000356,0.6717752916666844,0.6719201250000576,0.6720588750000994,0.672192416666682,0.672337083333332,0.6724764166666621,0.6726152916666858,0.6727495833334008,0.672896500000085,0.6730326250000265,0.6731727916667296,0.6733049583333923,0.6734503333334335,0.6735922500000016,0.6737292916666775,0.6738671666667263,0.6740015833334231,0.6741457500000252,0.674280166666722,0.6744153333334301,0.6745645833333886,0.6747004166667466,0.6748403333333651,0.6749773750000411,0.6751107083334015,0.675257000000056,0.675396625000091,0.6755363333333662,0.6756790416666869,0.6758106250000613,0.6759500000000116,0.6760936666666869,0.6762297083333881,0.6763702500000364,0.6765070000000075,0.676642916666727,0.6767894583333448,0.6769224583333805,0.677065833333351,0.6772057916667109,0.6773425416666821,0.6774807083334357,0.6776248750000378,0.6777622083334184,0.6778990000000097,0.6780324583333519,0.6781731666667231,0.6783128333333782,0.6784476250000201,0.6785942499999995,0.678725666666772,0.678877750000053,0.679012375000093,0.6791821666666995,0.6793424583333642,0.6794198333334255,0.6795701250001003,0.679706958333433,0.6798469583334129,0.6799840000000889,0.6801159166666669,0.6802620000000995,0.6804018750000977,0.680540208333332,0.6806791666667171,0.6808214166667312,0.6809575833334142,0.6810886666667405,0.6812359583333697,0.6813718750000892,0.6815089166667652,0.6816468333334342,0.6817897916667183,0.6819225000000491,0.682076291666696,0.6822053333333316,0.6823490833333684,0.6824818750000607,0.682624666666743,0.6827604583333595,0.6829019166667422,0.6830385416667316,0.6831819583334436,0.6833211666666709,0.6834573333333538,0.683590958333419,0.6837359166667738,0.6838801666667375,0.6840085000001029,0.6841541666667278,0.6842912916667653,0.6844253333333957,0.684570708333437,0.6847135833333595,0.6848527083333465,0.684989333333336,0.6851320833333981,0.6852633333334476,0.685399791666714,0.6855466250000366,0.6856779166667063,0.6858236666666926,0.6859637916667756,0.6860999583333371,0.6862354583333702,0.6863801250000203,0.6865138750000672,0.6866555000000517,0.6867896250000437,0.6869303333334149,0.6870719166667792,0.6872139166667087,0.687353416666762,0.6874873333334108,0.6876332083333788,0.6877669583334257,0.6879137083333868,0.6880439166667202,0.6881836666667368,0.6883210833333578,0.6884646666666716,0.6886082500001066,0.688743500000055,0.6888840833334446,0.6890229583333469,0.6891614166666841,0.6892941666667564,0.6894398333333811,0.689578916666748,0.6897143750000396,0.689856500000072,0.6899947500000659,0.6901326666667349,0.6902762916666688,0.6904106666667454,0.6905497916667325,0.6906936250000096,0.6908217916667733,0.6909695416667091,0.691108291666751,0.6912473749999966,0.6913837083334026,0.6915222083333599,0.6916597500000837,0.6917964583334348,0.69194150000003,0.6920800000001085,0.6922159583334481,0.6923560833334098,0.6925005000000966,0.6926349583334134,0.6927743333333638,0.6929171666666661,0.6930484166667157,0.6931945000000269,0.6933339583333388,0.6934608750000432,0.6936109583333746,0.6937438333334285,0.6938845000000583,0.6940217916666976,0.694165958333421,0.6943045833333599,0.6944417916667589,0.6945813333334324,0.6947206666667626,0.6948641666667148,0.6949979583333818,0.6951333333334333,0.6952751250000195,0.6954166666667637,0.6955590000000181,0.6956914583333855,0.6958345833333927,0.6959692083334327,0.696111000000019,0.6962472500000634,0.6963877500000915,0.6965249583333691,0.6966715833333486,0.6968059583334252,0.6969435416667693,0.6970798333334339,0.6972294583333375,0.6973621250000481,0.6974995416666692,0.6976411666667749,0.6977765833334464,0.6979188333333393,0.6980582083334108,0.6981939166666659,0.6983367916667097,0.6984770000000329,0.6986178750000059,0.698753000000094,0.698895916666758,0.6990303750000748,0.6991669166667028,0.699311750000076,0.699446750000061,0.6995880416667205,0.6997253333333598,0.699862916666704,0.7000075416667338,0.700146000000071,0.7002822500001155,0.7004175000000639,0.7005615833334257,0.700701500000044,0.7008360000001024,0.7009687083334332,0.7011189166667464,0.7012566250000721,0.7013956666666975,0.7015312500000922,0.7016692083333813,0.7018122500000269,0.7019500416667143,0.7020912083333921,0.7022274166666951,0.7023668750000069,0.7025039166666829,0.702640625000034,0.7027827083334462,0.702922500000083,0.7030601250000472,0.703197458333428,0.7033394166667374,0.7034735833333495,0.7036163750000317,0.7037568333334396,0.7038937500000126,0.7040335833333908,0.7041730833334441,0.7043150416667534,0.7044536250000722,0.7045896250000321,0.7047308333333301,0.70486541666675,0.7050094583333703,0.7051472500000576,0.705284208333372,0.7054224166667458,0.7055642916666935,0.7057025000000673,0.7058375416666726,0.7059820000001006,0.7061188333334333,0.7062575416667338,0.7064024166667271,0.70653929166668,0.7066737499999969,0.7068187916667132,0.7069507916667741,0.7070976666667169,0.7072292083333499,0.707370250000046,0.7075067083334337,0.7076490416666881,0.7077873333334234,0.7079298333334009,0.7080684583333399,0.7082039583333729,0.708342041666765,0.7084814583333354,0.7086256666666789,0.708764458333341,0.7089010000000902,0.7090385833334343,0.7091773750000964,0.7093179166667445,0.7094563333333402,0.7095925416667644,0.7097398750000139,0.7098785000000741,0.7100156250001116,0.7101518333334146,0.7102930833333327,0.7104308333333998,0.7105665833333963,0.7107059166667266,0.7108448750001116,0.7109840000000986,0.7111232083334471,0.7112690833334151,0.7114067083333794,0.7115444166667051,0.7116762083334227,0.7118170416667756,0.7119589583333437,0.7120988333333419,0.7122399166667795,0.7123778750000687,0.7125202500000645,0.7126517083333359,0.7127907916667027,0.7129328333333737,0.7130702083333744,0.7132110416667274,0.7133492083333598,0.7134908750000856,0.7136305416667407,0.7137660416667738,0.7139047500000743,0.7140402500001073,0.7141835416667164,0.7143188750000263,0.7144653333334039,0.7146017500000501,0.7147445833333526,0.7148822083334381,0.7150170000000798,0.7151630833333911,0.7152984166667011,0.7154366250000749,0.7155705000001035,0.7157114166666967,0.7158466250000249,0.7159923333333912,0.716129333333447,0.7162694166666673,0.7164082083333293,0.7165448750000603,0.7166821666666995,0.7168284583333541,0.7169656250000116,0.7171045833333968,0.7172398750000866,0.7173741666666804,0.7175185000000056,0.7176610833333447,0.717795958333348,0.7179400000000896,0.71807470833337,0.718216791666661,0.7183530416667054,0.7184883750000154,0.7186364166667772,0.7187743333334462,0.7189140000001013,0.7190549583334359,0.7191924166666771,0.7193292916667512,0.7194641250000131,0.7196082499999951,0.7197428750000351,0.7198800416666927,0.7200259583334021,0.7201657083334188,0.7202994166667244,0.7204364166667802,0.720580541666762,0.7207220416667648,0.7208587916667359,0.7209942083334074,0.7211327916667263,0.7212749166667588,0.7214140833333659,0.7215469166666784,0.721692541666683,0.7218322916666996,0.7219701250000071,0.7221062083333284,0.7222497916667635,0.7223870416666613,0.7225284583334238,0.7226686666667471,0.7228082083334205,0.7229435833333506,0.723082250000031,0.7232166250001076,0.7233617500000643,0.7234961250000197,0.7236390833334251,0.7237735000000005,0.7239112916666879,0.7240581666667519,0.72418937500006,0.7243303333333946,0.7244720416667405,0.7246102500001144,0.7247496666666848,0.7248955416667741,0.7250306666667409,0.7251661666667739,0.7253025833334201,0.7254437916667181,0.725584958333396,0.7257159583333608,0.7258647500000127,0.7259939166667512,0.726139916666701,0.7262801666667655,0.7264174166666635,0.7265575833333666,0.7266913750000337,0.7268325833333317,0.7269792916666726,0.7271123750000698,0.7272500416667753,0.7273902083333572,0.7275311666666918,0.7276682500001092,0.7278076666666796,0.7279460000000351,0.7280835000000176,0.7282234999999976,0.7283648750000187,0.7284992916667155,0.7286415416667296,0.7287815833333298,0.7289194999999987,0.7290576666667524,0.7291951666667349,0.729336041666708,0.7294729166667822,0.7296187916667501,0.7297529166667421,0.7298944166667449,0.7300316250000226,0.7301708333333712,0.7303109583333328,0.7304479583333887,0.7305853750000096,0.7307287500001015,0.7308654166667111,0.7310014166666708,0.7311440416667513,0.7312817500000771,0.7314225000000685,0.7315590000000763,0.731702208333445,0.731840333333336,0.7319798750000094,0.7321168750000652,0.7322544166666679,0.7323988333333545,0.7325320416667334,0.7326750000000175,0.7328103750000688,0.7329508750000968,0.7330882916667179,0.7332266666666934,0.7333686250000028,0.7335073750000447,0.7336455000000569,0.7337819166667032,0.7339227500000561,0.7340606250001049,0.734202708333396,0.7343426666667559,0.7344825416667542,0.7346195833334301,0.7347592083333438,0.7349028750000192,0.7350383750000522,0.7351766666666663,0.7353169166667309,0.7354482083334005,0.7355897500000235,0.7357311666666646,0.7358702083334113,0.736011541666691,0.7361490000000533,0.736289791666665,0.7364294583334413,0.7365742083333316,0.736707500000072,0.7368439583333384,0.7369775000000421,0.7371182083334133,0.7372601250001025,0.7373988750000232,0.7375345833333995,0.7376771666667385,0.7378130000000965,0.7379580416666917,0.7380955416666741,0.7382324166667483,0.7383748750001057,0.7385120833333834,0.738654416666759,0.7387865000000602,0.7389227083333633,0.7390712083334317,0.7392055416667669,0.7393479166667627,0.7394879166667427,0.7396216666666684,0.7397615833334081,0.7399037916666809,0.7400423749999997,0.7401800833334468,0.7403156250001,0.7404616250000496,0.7405970833333413,0.7407324166667725,0.740876500000013,0.7410147083333868,0.7411495833333902,0.7412966666666762,0.7414316666666613,0.7415671250000742,0.7417098750000151,0.7418482083333705,0.7419884166666937,0.7421282500000719,0.7422658750000362,0.7424098750000364,0.7425434166667401,0.7426807083333794,0.7428230000000137,0.7429614583333508,0.7430997916667063,0.7432391666667778,0.743377500000012,0.7435170416666854,0.7436567083333405,0.7437927083334216,0.7439307916666924,0.7440728333333634,0.7442106250000506,0.7443577916666981,0.744488916666766,0.7446324166667182,0.7447695000000143,0.74490720833334,0.745053041666688,0.7451907083333935,0.7453195000000657,0.7454671666667613,0.7456065833333317,0.7457429166667376,0.7458842916667587,0.7460202500000984,0.7461570000000696,0.7462987916667772,0.746430666666735,0.7465750000000602,0.7467162083333582,0.7468558750000133,0.7469940000000255,0.7471306250000149,0.7472716666667111,0.7474119583333959,0.7475505833333348,0.7476850000000316,0.7478289583334117,0.7479656250000214,0.7481114583333692,0.7482472916667272,0.7483849166666914,0.748518624999997,0.7486599166667778,0.7487980416666687,0.7489210833333345,0.74906875000003,0.7492089166667332,0.7493351250000463,0.7494822500000737,0.7496209583333742,0.7497557916667574,0.7498992916667097,0.750040041666701,0.750177083333377,0.7503162500001054,0.7504505000000791,0.7505899166667708,0.7507376666667066,0.7508714583333737,0.7510141666666944,0.7511495833333659,0.7512867500000235,0.7514325833333715,0.7515641250000045,0.7517036250000577,0.7518412916667633,0.7519880416667244,0.752122958333348,0.7522656666666686,0.7524042083333673,0.7525361666666868,0.7526746250000239,0.7528163750001113,0.7529584583334024,0.7530916250000398,0.7532413333334261,0.7533692500001052,0.7535178750000341,0.7536559166666847,0.7537895000000087,0.7539254583333483,0.7540657500000331,0.7542122916667722,0.7543425833333458,0.7544830416667537,0.7546297083333532,0.7547692500000267,0.7549048750000414,0.7550435833333419,0.755186666666729,0.7553219583334188,0.7554544166666649,0.7555995000000014,0.7557371250000869,0.7558711250000972,0.7560207916667423,0.7561582083333633,0.756292458333337,0.7564390000000761,0.7565673750000618,0.7567177916667182,0.7568448333334042,0.7569882083333748,0.7571301666666841,0.7572721666667348,0.7574007500000638,0.7575461250001051,0.7576833750000029,0.7578263750000285,0.757964041666734,0.7581044166667804,0.7582345833333723,0.7583802083333769,0.7585180000000643,0.7586558333333717,0.7587940416667455,0.7589363333333797,0.7590725416666828,0.7592142500000288,0.7593471250000827,0.7594986666666955,0.7596293333333354,0.7597692500000751,0.7599047500001083,0.7600511666667444,0.7601806666666865,0.7603317083333726,0.7604635416667104,0.7606048333333698,0.7607367083333277,0.760887583333412,0.761022541666777,0.7611625416667569,0.7612976250001036,0.7614385000000766,0.7615763750000042,0.7617101666666712,0.761857666666765,0.7619871666667071,0.7621336666667048,0.7622758333333574,0.7624145416667791,0.7625520000000203,0.7626911250000072,0.7628278750000997,0.7629608333333938,0.7631097083334074,0.7632471666667697,0.7633901250000539,0.7635269583333866,0.7636659166667717,0.7638075833333763,0.7639411666667002,0.7640805416667718,0.7642227083334243,0.7643624166666996,0.7644957500000601,0.7646347083334452,0.7647675000000163,0.7649188333334072,0.7650518750000629,0.7651945416667635,0.7653307916666866,0.7654707500000465,0.7656112500000745,0.7657485416667138,0.7658897083333917,0.7660237500000221,0.7661602916667714,0.7663015000000694,0.7664446666666966,0.7665750000000117,0.7667157916667444,0.7668660416666777,0.7669993333334181,0.7671381250000802,0.7672783333334033,0.7674132916667683,0.7675506666667692,0.7676872500000173,0.7678330416667449,0.7679745416667477,0.7681098750000577,0.7682535000001128,0.7683897500000361,0.7685303750000457,0.7686695000000328,0.7688090416667062,0.7689506250000704,0.769080541666699,0.7692157916667687,0.7693670833334181,0.7695002916666757,0.76964116666677,0.7697796250001071,0.7699193333333824,0.7700610416667284,0.7701920833334346,0.7703311666666802,0.7704711666667815,0.7706162083333765,0.7707542500000273,0.7708921666666962,0.7710342500001085,0.7711725000001024,0.7713121250000161,0.7714479999999942,0.7715887083333655,0.771726541666673,0.7718621666666877,0.7720036666666904,0.7721397916667532,0.7722817916666826,0.772417875000004,0.772561791666764,0.7727042083333799,0.7728403333334427,0.7729756250000113,0.773121416666739,0.7732550000000629,0.773392083333359,0.7735336250001031,0.7736764583334055,0.7738131666667566,0.7739548750001025,0.7740875416666919,0.7742331666666966,0.7743712083333473,0.774511125000087,0.7746446250000493,0.7747866250001001,0.7749209166666939,0.7750662500001151,0.775200208333384,0.7753420000000915,0.7754830833334078,0.7756191666667291,0.7757620000000316,0.7758953750000122,0.7760323333334479,0.7761740416666726,0.7763141250000142,0.776454083333374,0.7765884166667092,0.7767270416667694,0.7768686250000125,0.7770117083333995,0.777153000000059,0.7772919166667028,0.7774245833334135,0.7775695416667683,0.7777098333333318,0.7778427916667473,0.7779825833333841,0.7781185000001035,0.7782619583334357,0.7784023750001021,0.7785331250001036,0.7786729166667404,0.7788150000000315,0.7789556666666613,0.7790996250000414,0.7792315416667407,0.7793716666667023,0.7795124166666938,0.779646041666759,0.7797945833334476,0.7799281666667714,0.780066000000079,0.7802077916666652,0.7803482916666932,0.78048737500006,0.780624791666681,0.780760250000094,0.7809050000001055,0.7810401250000722,0.7811808333334436,0.7813221666667232,0.7814581250000628,0.781597958333441,0.7817422083334047,0.7818702500000654,0.7820203333333969,0.7821514166667233,0.782293416666774,0.7824307083334133,0.7825737916666792,0.782708208333376,0.782845416666775,0.7829867916666747,0.7831261666667463,0.783264916666667,0.783402625000114,0.7835437500000505,0.7836875833333276,0.7838177083334207,0.7839581250000871,0.7840982500000488,0.7842353333333449,0.784376875000089,0.7845209583333296,0.7846567083334473,0.7847936250000203,0.7849326250000256,0.7850706666666762,0.7852092916667365,0.7853552083334459,0.7854898333333646,0.7856324583334451,0.7857674583334301,0.7859035000000101,0.7860448750000312,0.7861817916667254,0.7863241250001011,0.7864615833333422,0.7865992083334277,0.7867449166666726,0.7868792083333876,0.7870152083333475,0.78715200000006,0.7873032916667095,0.7874368750000333,0.787574041666691,0.7877153750000919,0.7878480000000612,0.7879916249999951,0.788135375000032,0.7882652500000404,0.7884148333334451,0.7885464583334396,0.7886893750001036,0.7888198333334003,0.7889696666667684,0.7891039166667421,0.7892448333333353,0.7893845833333519,0.7895269166667276,0.7896620833334358,0.7898027916666858,0.7899364583333711,0.7900761666667677,0.7902194999999969,0.7903509166667694,0.7905003333333298,0.7906288750000385,0.7907721666667687,0.7909120000000257,0.7910505000001042,0.7911865833334256,0.791331125000094,0.791467666666722,0.791605750000114,0.791745583333371,0.7918854166667492,0.7920285416667563,0.7921568750000005,0.7923059166667372,0.7924452916666875,0.7925753750000392,0.7927180416667398,0.7928577083333949,0.792998250000043,0.7931331250000464,0.7932764166667766,0.7934110833334368,0.7935570416667663,0.793686458333347,0.793832500000038,0.7939665416666685,0.7941093333333508,0.7942496250000356,0.7943835833334257,0.7945302500000253,0.7946662916667264,0.7948082083334157,0.7949456250000366,0.7950842500000969,0.7952182500001073,0.795356833333426,0.7955038750000919,0.7956424166666693,0.7957766666667643,0.7959152500000831,0.7960540416667451,0.796194708333375,0.7963382916666888,0.7964699166666833,0.7966113333334458,0.7967495000000782,0.7968944166666916,0.7970239166667549,0.7971636250000301,0.7973090416666916,0.7974434583333884,0.7975839166666749,0.7977283333333617,0.7978622083333903,0.7979986250000366,0.7981422083333504,0.7982746666667178,0.798417833333345,0.7985546250000577,0.7987023750001148,0.7988351250000657,0.7989750833334256,0.7991122083333418,0.7992533333333995,0.7993859583333688,0.7995252083333374,0.7996646666667705,0.7998064583333568,0.7999437499999961,0.8000891666667788,0.8002282916667658,0.8003627916667029,0.8005053750000418,0.8006429166667658,0.8007809166666751,0.8009215000000647,0.8010557083334182,0.8011951250001099,0.8013320833334243,0.8014790833333488,0.8016137500000089,0.8017558333334213,0.8018971250000807,0.8020400000000033,0.8021690416667601,0.8023114166667559,0.8024520833333857,0.8025860833333961,0.8027299166666731,0.802864500000093,0.8030067083333657,0.8031494583334279,0.8032805000000128,0.803423958333345,0.8035639166667049,0.8037012916667057,0.8038403750000725,0.803980791666739,0.8041168750000603,0.804256625000077,0.8043939166667163,0.8045427916667298,0.8046710000001137,0.8048151250000956,0.8049525833333367,0.8050962916667534,0.8052541666667821,0.8053647500000807,0.8055035000000014,0.8056418333333568,0.8057847083334005,0.805925833333337,0.806063875000109,0.8062008750000434,0.8063427083333712,0.8064772083334295,0.8066169583334462,0.8067653750000318,0.8068985416666692,0.8070407916666833,0.8071768333333845,0.8073125416667608,0.8074565000000197,0.8075872500000211,0.8077325000000807,0.8078699583334431,0.8080132500000521,0.8081525416667622,0.8082895000000766,0.8084261666666862,0.8085684583334417,0.808705250000033,0.8088514166667058,0.8089801666667579,0.8091274166667669,0.8092617083333608,0.8093983750000916,0.8095401250000578,0.8096771250001136,0.8098183333334116,0.8099559583333757,0.810089083333393,0.8102327500000683,0.8103746250000161,0.8105115416667104,0.8106507083334388,0.8107927500001096,0.8109272916666669,0.8110690000000128,0.8112048333333708,0.8113439583333578,0.8114852500000173,0.8116324583334062,0.8117645416667074,0.8119013750000401,0.8120384583333362,0.8121823333333548,0.8123253750000003,0.8124593333333905,0.8125983333333958,0.812740958333355,0.8128770416666763,0.8130129166667757,0.8131533750000624,0.8132866666666814,0.8134329166667158,0.8135737083334486,0.8137107916667446,0.8138487500000338,0.8139912083333911,0.8141256250000879,0.8142640416666836,0.814403208333412,0.8145404583334311,0.8146877083334403,0.814821958333414,0.81495833333344,0.8150956250000794,0.815247958333445,0.815376083333346,0.8155236250000598,0.8156580833333767,0.8157947916667277,0.8159355000000991,0.8160689583334412,0.8162151666667341,0.8163517083333621,0.8164972500000052,0.816627875000025,0.8167652500000259,0.8169162916667119,0.8170490416666628,0.8171844583333344,0.8173250833333441,0.8174613750000087,0.8176027500000297,0.8177380416667196,0.8178833333333994,0.8180139583334191,0.818161875000078,0.8182997500000055,0.8184349166667138,0.8185737916667374,0.818713541666754,0.8188534583333724,0.8189923750000162,0.8191327083334424,0.8192719166666697,0.8194115000000844,0.8195507916666732,0.8196873750000425,0.8198259166667412,0.8199650416667282,0.8201067083333328,0.820245833333441,0.8203785416667718,0.820522875000097,0.8206621666666858,0.820800791666746,0.8209441666667165,0.8210781250001067,0.8212201666667777,0.8213545416667329,0.8214932916667749,0.8216317916667322,0.8217694583334378,0.8219105416667541,0.8220502916667708,0.8221883750000416,0.8223265000000538,0.822465500000059,0.822604124999998,0.8227435833334311,0.8228870416667633,0.8230240000000777,0.8231636250001126,0.8233016666667633,0.8234392083333659,0.8235767083333485,0.8237204166667652,0.8238597916667155,0.8239967083334098,0.8241382083334126,0.8242758749999969,0.8244202083334433,0.8245531666667375,0.8246923333333446,0.8248322916667045,0.8249725000000278,0.8251092916667403,0.8252501250000932,0.8253880416667623,0.8255280416667422,0.8256666666666812,0.8258049583334165,0.8259455000000647,0.8260844583333286,0.8262280833333837,0.8263599583333416,0.8265003750000081,0.8266428333333654,0.8267829583334484,0.8269181666667768,0.8270560000000842,0.8271970416667803,0.8273365833333325,0.8274725833334136,0.827614583333343,0.8277528333333369,0.8278896250000495,0.8280304583334025,0.8281687083333964,0.828306375000102,0.8284490000000612,0.828582583333385,0.828718416666743,0.8288588750000296,0.8290059166666954,0.8291433333334377,0.8292838333333444,0.8294212083333453,0.8295580833334194,0.8297041250001106,0.829835083333334,0.8299766666666983,0.8301166666666783,0.8302534583333909,0.8303908750000119,0.8305329583334242,0.8306738333333973,0.8308102500000435,0.8309519583333895,0.8310883750000357,0.8312245833333388,0.8313675000000027,0.8315025833333494,0.8316446250000202,0.8317846250000003,0.8319227083333923,0.8320592083334001,0.8322016666667574,0.8323399166667513,0.8324613333334128,0.8326014999999946,0.8327414166667343,0.8328800000000531,0.8330176250000174,0.8331569166667274,0.8333039583333933,0.8334343333333284,0.8335745416667729,0.8337147500000962,0.8338588333333367,0.8339908333333975,0.8341352500000843,0.8342738750000233,0.8344094583334178,0.8345540833334477,0.8346866250000554,0.8348252916667358,0.834970833333379,0.8351124583333633,0.8352433750000879,0.8353863750001135,0.835529750000084,0.8356655000000804,0.8358046250000674,0.8359429166666814,0.836082291666753,0.8362141250000907,0.8363513333333685,0.8364955000000919,0.8366340416666692,0.8367691666667573,0.8369119166666982,0.8370524166667261,0.8371877916667775,0.8373353750001116,0.8374712083333482,0.8376107916667631,0.8377509166667247,0.8378815000000032,0.8380219166666696,0.8381620000000112,0.8382994583333736,0.8384398333334199,0.8385833750001136,0.8387166666667326,0.8388617083333277,0.8389950416666883,0.8391440416666834,0.8392827916667254,0.8394115416667773,0.8395524583333706,0.8396989166667481,0.8398285000000517,0.8399698750000728,0.8401075416667785,0.8402521666666871,0.840387958333425,0.8405326666666951,0.8406694166666663,0.8408019166667752,0.8409447916666977,0.8410822083334399,0.8412180416666767,0.8413591666667344,0.8415083333333314,0.8416374166667083,0.8417831666666946,0.8419217500000135,0.8420557083334036,0.8421999583333672,0.8423350416667138,0.8424808333334416,0.8426151250000354,0.8427480416667095,0.8428943750001053,0.8430323333333944,0.8431703750000452,0.8433042500000738,0.8434434583334223,0.8435883750000357,0.8437272916666795,0.8438619583333397,0.8440081666667538,0.8441413333333913,0.8442775000000741,0.8444212916667311,0.8445631250000588,0.8447013750000527,0.8448331250000289,0.8449742500000866,0.8451145416667714,0.8452602916667578,0.8453926666667636,0.8455300833333846,0.8456785833333318,0.8458127916666853,0.8459530833333702,0.8460908750000574,0.8462322083333371,0.8463711666667223,0.8465107083333957,0.8466470833334218,0.8467874583333469,0.8469179166667649,0.8470641250000578,0.8471959583333956,0.8473425000000134,0.8474821666666685,0.8476136666666814,0.8477624166667131,0.8478989583333411,0.8480305416667154,0.8481812916666968,0.8483102083333506,0.8484513750000284,0.8485938333333858,0.8487338750001072,0.8488685416667674,0.849003625000114,0.8491540000000289,0.849286916666703,0.8494232916667291,0.8495706666667199,0.8497000416666803,0.8498535833333638,0.8499817916667477,0.8501246250000501,0.8502597083333967,0.850404250000065,0.8505378750000091,0.8506832500000504,0.8508183750000171,0.8509560000001026,0.851093333333362,0.8512355000000146,0.8513730833333587,0.8515123333334487,0.851655166666751,0.851792916666697,0.851930125000096,0.8520673750001151,0.8522085416666717,0.8523479583333634,0.852485125000021,0.8526257083334107,0.8527630833334114,0.8529021666667783,0.8530436250000396,0.8531842500000494,0.8533172916667051,0.8534592916667558,0.853596749999997,0.8537364166667734,0.8538774583333483,0.8540154999999989,0.8541538333333544,0.8542929166667211,0.8544316666667631,0.8545697500000339,0.8547092500000872,0.8548500416666988,0.8549875833334226,0.8551191250000556,0.8552675416667626,0.8554040000000289,0.8555435416667023,0.8556830416667557,0.8558218750000378,0.8559602500000134,0.8560995416667235,0.8562420416667009,0.8563802500000748,0.856512875000044,0.8566600416666915,0.8567970416667473,0.8569350416667779,0.8570693750001132,0.8572098333333997,0.8573554166666629,0.8574926666666821,0.8576330000001083,0.8577706250000726,0.857904291666758,0.8580423750000288,0.8581905000000309,0.8583288333333864,0.8584620000000238,0.8586072916667036,0.858738541666753,0.8588830000000598,0.8590216249999988,0.8591583333333498,0.8593018750000435,0.8594370833333718,0.8595757500000522,0.859716083333357,0.8598541666667491,0.8599915000000086,0.8601380833333678,0.8602682083333396,0.8604130833333329,0.8605536250001024,0.8606898750000255,0.8608243333333424,0.8609595833334122,0.8611029583333827,0.86124612500001,0.8613849583334134,0.8615213333334395,0.8616660833333298,0.8617989166667637,0.8619424166667159,0.8620722083333627,0.8622109583334047,0.8623550833333866,0.8624965833333893,0.8626407500001126,0.8627712083334094,0.8629098750000898,0.863052541666669,0.8631898333334296,0.8633296666666865,0.8634656250000262,0.8636092916667015,0.8637435416666752,0.8638891250000598,0.8640219166667521,0.8641585833333617,0.8643011250000806,0.8644417916667104,0.8645806250001139,0.8647219166667734,0.8648624583334216,0.8650019583333536,0.8651364583334119,0.8652813750000253,0.8654177083334313,0.8655518333334233,0.8656947500000872,0.8658333750000262,0.8659675000000182,0.866109875000014,0.8662465000000036,0.8663861666667799,0.8665281250000892,0.8666666250000465,0.8668045416667155,0.8669407083333984,0.8670867500000895,0.867222166666761,0.8673605416667366,0.8674969583333829,0.8676433750000191,0.8677800000000085,0.8679200833333501,0.8680539999999989,0.868197458333331,0.8683337499999956,0.8684772916666892,0.8686124583333973,0.8687509583333546,0.8688939583333801,0.869030625000111,0.8691683333334368,0.8693080833333321,0.8694467916667539,0.8695827083333522,0.8697285416667,0.86985920833334,0.8700045416667611,0.8701480416667133,0.8702836666667281,0.8704243333333579,0.8705537083334396,0.8707013333333937,0.8708342083334476,0.8709769166667684,0.8711122083333369,0.8712512916667038,0.8713947500000359,0.8715352083334438,0.8716713750000054,0.871809041666711,0.8719444583333825,0.8720871666667033,0.8722316250000101,0.8723639166667757,0.8725061250000484,0.872645375000017,0.8727817500000431,0.8729253750000984,0.8730585833333558,0.8732012916666766,0.8733412916667779,0.8734826666666777,0.8736225000000559,0.8737536666667438,0.8738945416667169,0.874031291666688,0.8741710833334461,0.8743173333333591,0.8744495416667633,0.874588291666684,0.8747253750001013,0.8748677916667172,0.8750052916666997,0.8751475000000937,0.8752827500000422,0.8754230416667269,0.8755688750000749,0.875698041666692,0.8758472083334102,0.8759794166666931,0.8761196666667578,0.876259375000033,0.8763957916666792,0.8765355000000757,0.8766783333333782,0.8768158333333607,0.8769574583333452,0.877091541666717,0.8772320833333651,0.8773736250001093,0.8775073333334149,0.8776546666666643,0.8777853750000456,0.8779280833333662,0.8780646250001155,0.8782053750001069,0.8783406666666754,0.8784829166666895,0.8786185000000841,0.8787614166667481,0.8789012083333849,0.8790435416667606,0.8791776666667526,0.8793218750000961,0.8794570000000628,0.8795988333333905,0.8797316250000828,0.8798748333333303,0.8800117500000245,0.8801516666667643,0.8802885416667171,0.8804325000000972,0.8805701250000614,0.8807082083333323,0.8808427916667522,0.8809866250000292,0.8811224583333872,0.8812649166667446,0.8814030833333769,0.8815441250000731,0.8816858750000393,0.8818197500000678,0.8819611250000889,0.8820967916667238,0.8822386250000515,0.8823788749999949,0.8825160416667738,0.8826529583333468,0.8827872083334417,0.8829252500000924,0.8830691666667311,0.8832164166667401,0.8833526666666633,0.8834849166666875,0.8836299166666625,0.8837658750000021,0.8839074583333665,0.8840418333334431,0.8841843333334206,0.8843217500000417,0.8844586666667359,0.8846041666667588,0.8847358750001149,0.8848785000000741,0.8850145000000339,0.8851549166667003,0.8852953750001082,0.8854382083334106,0.8855718333333547,0.8857171666667758,0.8858509583334429,0.8859904583333749,0.8861322916667026,0.8862684583333854,0.8864037083333339,0.886545250000078,0.8866869166666826,0.8868215000001025,0.886967791666757,0.8870956250000746,0.887242291666674,0.8873815833333841,0.8875171666667787,0.8876547916667429,0.8877943750000364,0.8879417500000273,0.8880725833333902,0.8882160833333425,0.888355791666739,0.8884956249999959,0.8886398333333394,0.8887686250000115,0.888912125000085,0.8890447083334342,0.8891844583333295,0.8893327916666749,0.8894697500001105,0.8896069583333883,0.8897443750000094,0.889888791666696,0.8900252916667039,0.8901607499999955,0.8903003750000305,0.8904351250000521,0.8905809583334,0.8907197083334419,0.8908550000000105,0.8909955000000385,0.8911367083333365,0.8912692500000655,0.8914104166667433,0.8915510833333732,0.8916923333334126,0.8918303333334431,0.8919724583333543,0.892106708333328,0.8922507083333282,0.892387208333336,0.8925254166667097,0.8926659583333579,0.8928026666667089,0.8929448750001029,0.8930835833334034,0.8932208333334226,0.8933618749999975,0.8934989583334149,0.8936352916666995,0.8937818750000588,0.8939151666666779,0.8940525833334202,0.894196708333402,0.8943282916667764,0.8944710833333375,0.8946088333334046,0.8947523333333568,0.8948934166666731,0.8950314166667037,0.8951669166667368,0.8953074583333849,0.8954387083334344,0.895579166666721,0.8957222500001081,0.8958656666666988,0.8960021666667065,0.8961400000000139,0.8962792500001039,0.8964143333333292,0.8965592083334438,0.8966989583333391,0.8968358333334133,0.8969750833333819,0.8971115416667695,0.8972526250000858,0.8973937916667637,0.8975318333334144,0.8976718333333944,0.8978087083333472,0.8979487500000687,0.8980823333333926,0.8982303750000331,0.8983603750000232,0.8985059583334077,0.8986400416667796,0.8987830416666839,0.89892408333338,0.8990572916667589,0.8991993333334297,0.8993385833333983,0.8994795416667329,0.8996157083334159,0.8997542500001146,0.8998925833333488,0.9000310416666859,0.9001722916667253,0.9003088333333532,0.9004485000000083,0.900585666666666,0.9007250833333577,0.9008655833333857,0.9010066250000819,0.9011440416667028,0.90128250000004,0.9014220416667134,0.9015614583334052,0.9016956250000173,0.9018372916667431,0.9019828333333862,0.9021177500000097,0.9022547916666857,0.9023977916667112,0.9025320833334263,0.9026732916667243,0.9028136250000292,0.9029540000000755,0.903090125000017,0.9032289583334204,0.9033655000000483,0.9035089583333805,0.9036456250001114,0.9037782916667008,0.903922791666749,0.9040630416666924,0.9042042500001116,0.9043382916667421,0.9044776250000723,0.9046206666667179,0.9047565416666961,0.9048995833333416,0.9050380416666788,0.9051769166667024,0.9053200416667095,0.905447833333407,0.905589041666705,0.9057292916667696,0.9058723750000354,0.9060124999999971,0.9061547916667526,0.9062844166666764,0.9064300833334225,0.9065673750000618,0.9067058333333989,0.9068424583333884,0.9069828750000549,0.907120958333447,0.9072581250001046,0.907402874999995,0.9075377499999983,0.9076761666667152,0.9078164166667799,0.9079493333333327,0.9080939583333626,0.9082332500000727,0.9083706250000735,0.9085116666667697,0.9086524583333813,0.9087866250001146,0.9089329166667691,0.9090698333333421,0.9092086666667456,0.9093454583333369,0.9094820833334476,0.9096254166666767,0.9097638750000139,0.9098994166666671,0.9100387083333772,0.9101843333333818,0.9103214166666779,0.9104589166667817,0.9105933750000986,0.9107377083334237,0.910877041666754,0.9110139583334482,0.9111492500000168,0.9112962083334424,0.911434583333418,0.9115711250000459,0.911709083333335,0.9118494166667612,0.9119829583333436,0.9121270416667054,0.9122596250000545,0.912400541666769,0.9125440833333414,0.9126848750000742,0.9128218333333886,0.9129615000000437,0.9130983333333764,0.9132387083334227,0.9133835416666746,0.9135165833333303,0.9136572500000815,0.9137917500000186,0.913931458333415,0.9140733750001042,0.9142116666667183,0.914350583333362,0.9144893333334039,0.9146285000000111,0.9147720416667047,0.9149083333333692,0.9150425000001027,0.9151846666667552,0.9153259166666733,0.9154621250000976,0.9156030416666908,0.9157424166667625,0.9158835416666988,0.9160065416667446,0.9161416250000911,0.9162812916667462,0.9164166250000563,0.9165570000001025,0.9167062916666813,0.9168363750000329,0.9169847916667399,0.9171234166666787,0.9172619583333774,0.9173927916667405,0.9175382500000221,0.917679083333375,0.917817166666767,0.9179591666666965,0.9180937916667365,0.9182267083334106,0.9183652500001093,0.9185137916666766,0.9186444166666964,0.9187834166667017,0.9189282500000748,0.9190623333334467,0.919208458333378,0.9193443333333562,0.9194851666667091,0.9196162500000356,0.919768041666733,0.9198940416667029,0.9200357500000488,0.9201789583334176,0.9203160000000935,0.9204523749999983,0.9205894583334157,0.9207277916667711,0.9208800833333953,0.9210065416666718,0.9211570416666898,0.9212925000001027,0.921429833333362,0.9215686666667655,0.9217081250000774,0.9218476250000094,0.9219869166667195,0.9221298750000035,0.922257666666701,0.9224067500000577,0.9225400000000566,0.9226820833333477,0.9228138333334451,0.9229546666666768,0.9231013333333976,0.923238291666712,0.923369833333345,0.923517041666734,0.9236570000000939,0.9238067916667205,0.9239249166667529,0.9240763750000042,0.9242055000000012,0.9243497916667063,0.9244819166667487,0.9246226249999988,0.9247660416667107,0.9249002916666844,0.9250397916667377,0.9251761666667638,0.9253191250000479,0.9254634166667529,0.9255932916667613,0.9257427916666833,0.9258711250000488,0.9260105833333606,0.9261590416666877,0.9262952916667321,0.9264273750000332,0.9265754166666739,0.926713166666741,0.9268559166666819,0.9269853750000039,0.9271287500000956,0.9272679583334441,0.9274077916667011,0.9275385416667026,0.9276868333334278,0.9278234166666759,0.9279667916667677,0.9281029166667092,0.9282342083333788,0.928373708333432,0.9285222083333793,0.9286515000000993,0.9287986666667469,0.9289292083334052,0.9290815000000293,0.929216583333376,0.9293464166667642,0.9294857500000944,0.9296343333334032,0.9297700833333996,0.9299040000000484,0.9300506666667692,0.9301883333333535,0.9303266250000888,0.9304705833333476,0.9306045416667378,0.9307495833333329,0.9308827083333502,0.9310210416667056,0.9311625000000883,0.9313039583333497,0.9314406666667007,0.9315702500000043,0.9317150416667573,0.9318565000000186,0.931997375000113,0.9321362916667567,0.9322723333333367,0.9324105833333306,0.9325568750001063,0.9326903750000687,0.9328312500000417,0.9329674583333447,0.9331058750000617,0.9332380416667244,0.9333821250000862,0.9335235416667274,0.9336622083334077,0.9337950833333404,0.933941916666663,0.9340816666666797,0.9342186250001153,0.9343587500000771,0.9344994583334483,0.9346370833334124,0.9347792916666852,0.9349159166666747,0.9350516666666712,0.9351966666667674,0.9353290000000318,0.9354622083334106,0.9356094166666783,0.9357530000001134,0.9358881250000801,0.9360250416667744,0.9361649583333929,0.9363004166666845,0.9364428333334217,0.9365766250000889,0.9367236666667547,0.9368620833333504,0.9369990833334062,0.9371436666666947,0.9372719583334401,0.9374165000001085,0.93755262500005,0.9376950833334073,0.9378350833333874,0.9379685000001093,0.9381106250000205,0.9382530000000163,0.9383870416667681,0.9385258333334302,0.9386684166667691,0.9388024166667795,0.9389385833333411,0.9390855833333869,0.9392230833333693,0.9393632500000725,0.9395015000000664,0.939642125000076,0.9397847916667766,0.9399165000000115,0.9400570000000396,0.9401981250000973,0.9403339583333339,0.9404786250001053,0.9406172500000441,0.9407582083333789,0.9408893333334466,0.941032875000019,0.9411760000000261,0.9413035416667602,0.941446291666701,0.9415923750000122,0.9417275416667205,0.9418661666667807,0.9420091666666849,0.9421399166666864,0.9422828750000918,0.9424222916666622,0.9425659166667174,0.942699791666746,0.9428403333333942,0.9429808750000424,0.943119791666686,0.9432528750000831,0.9433968750000834,0.9435328333334231,0.943670583333369,0.943811416666722,0.9439506250000704,0.9440909166667553,0.9442249166667656,0.9443720000000515,0.9445110000000568,0.9446505416667302,0.9447834166666629,0.9449266250000316,0.9450643333333574,0.9452046666666623,0.9453436250000474,0.9454836666667689,0.9456113750001047,0.9457563333333383,0.9458945000000919,0.9460413333334146,0.9461704583334115,0.9463167500000661,0.9464495416667584,0.9465928333333674,0.9467320416667159,0.9468679583334354,0.9470111250000628,0.9471474583333475,0.9472885416666638,0.9474281666666987,0.9475649166666699,0.9477050000000115,0.947839708333413,0.9479854583333993,0.9481256250001024,0.9482627083333985,0.9483997083333331,0.9485424583333952,0.9486754166666894,0.9488188333334013,0.9489541666667113,0.9490984583334163,0.9492324583334266,0.9493761250001019,0.9495133333333797,0.94964733333339,0.9497817083333454,0.9499304583333772,0.9500674166666916,0.9502096250000857,0.9503440833334025,0.9504859166667302,0.9506252916666805,0.9507600833334436,0.9509050416666772,0.951044125000044,0.951181666666768,0.951322041666693,0.9514605000000301,0.9515925416667111,0.9517380416667341,0.9518783333334189,0.9520137500000904,0.9521525416667524,0.9522880833334056,0.9524323333333693,0.9525684583334321,0.9527136250000088,0.9528414166667062,0.9529875416667589,0.9531280416666656,0.953267708333442,0.9534067083334473,0.9535469166667705,0.9536810833333826,0.9538195416667198,0.9539577916667137,0.9540965833333758,0.9542350000000928,0.9543761666667706,0.9545132500000667,0.9546526666667584,0.9547911250000956,0.9549356250000225,0.9550689166667629,0.9552073333333586,0.9553466250000686,0.9554902083333824,0.9556296250000742,0.9557681666667729,0.9559080416667711,0.9560431249999966,0.9561819166667799,0.9563236250000046,0.9564624166666665,0.956602958333436,0.9567415000000135,0.9568743333334472,0.9570195416667654,0.9571562916667365,0.9573013333333317,0.9574368750001061,0.9575678333333296,0.957714958333357,0.9578540416667238,0.957989083333329,0.9581329583333476,0.9582731666666707,0.9584088750000471,0.9585440000000138,0.9586852500000532,0.95882504166669,0.9589624583334323,0.9591054583333365,0.959243458333367,0.9593869583334406,0.9595252916666747,0.9596552083334245,0.9598005833333445,0.9599353333333662,0.9600791250000232,0.9602182500000102,0.9603598333333745,0.960496458333364,0.9606329583333718,0.9607751666667658,0.9609112083333458,0.9610493750000993,0.961185708333384,0.9613329583333932,0.9614710000000438,0.9616071666667267,0.9617445416667275,0.9618850416667556,0.9620212916666787,0.9621594583334324,0.962300291666664,0.9624355000001136,0.962574541666739,0.9627228750000844,0.9628540000000309,0.9629990000000058,0.9631377916666679,0.9632752083334102,0.9634151250000287,0.9635504583333386,0.9636960833333432,0.9638320000000627,0.9639692083333405,0.9641095833333869,0.9642463333333581,0.9643856666666882,0.9645234166667555,0.9646704166666799,0.9648063333333994,0.9649454583333863,0.9650821666667374,0.9652223750000606,0.9653612916667044,0.9655000000000048,0.965636375000031,0.9657763333333909,0.965913083333362,0.9660513750000973,0.9661971666667039,0.9663342499999998,0.9664700416667377,0.9666115416667405,0.9667467083334487,0.966889541666751,0.967033666666733,0.9671696666666928,0.9673054583334306,0.9674459583333374,0.9675871250000152,0.9677205833333573,0.9678652083333873,0.9679992083333976,0.9681392499999978,0.9682779166666781,0.9684193750000607,0.9685541250000824,0.9686985000000277,0.968835791666667,0.9689709999999953,0.9691118750000897,0.969254333333447,0.9693902083334252,0.9695294166667736,0.96966983333344,0.9698161666667147,0.969950874999995,0.9700862916666665,0.9702225833333311,0.9703647916667251,0.9705028333333757,0.9706412916667129,0.97077508333338,0.9709250416667298,0.9710548749999968,0.9711950833334413,0.9713326666666641,0.9714757500000512,0.9716102916667296,0.9717547916667778,0.9718897083334014,0.9720327083334268,0.9721680416667369,0.9723094999999982,0.9724552083333644,0.9725907083333974,0.9727284166667232,0.9728657083333625,0.9730034583334297,0.9731470416667435,0.9732799166666761,0.9734206666666675,0.9735670000000634,0.9737048750001123,0.9738366250000884,0.9739762500000021,0.9741204583333456,0.9742558333333969,0.97439666666675,0.9745323750000049,0.9746772916667397,0.9748180833333512,0.9749542916667754,0.9750887916667125,0.97522662500002,0.9753673750000114,0.9755085416666892,0.9756454166667633,0.9757857916666883,0.9759230416667075,0.9760582083334157,0.9761989166666657,0.9763357499999984,0.9764769583334176,0.9766162083333862,0.9767596666667183,0.9768964166666895,0.9770362916666878,0.9771745416666817,0.9773141250000966,0.9774540833333352,0.9775966250000541,0.9777290833334216,0.9778696666666898,0.9780113750000358,0.9781480416667667,0.9782889583333599,0.9784261250000176,0.9785721250000885,0.9787102083333593,0.9788423333334019,0.9789824583333636,0.9791213333333871,0.9792576250000518,0.9794017083334136,0.9795429166667114,0.9796800000000075,0.9798160833333289,0.9799632500000978,0.9800969583334033,0.980230500000107,0.9803713333333387,0.9805080416666897,0.9806529583334244,0.9807907083333702,0.9809280000000096,0.9810718750000281,0.9812062500001048,0.9813486250001006,0.9814870416666963,0.9816249166667451,0.9817641666667138,0.9818973333333513,0.9820404166667382,0.9821827916667341,0.9823185000001103,0.9824574999999943,0.9825983750000887,0.9827360000000529,0.9828745833333717,0.9830160416667544,0.9831562916666977,0.9832956666667694,0.9834333333333537,0.9835715833333476,0.9837100000000646,0.9838483750000402,0.9839888333334481,0.9841254166666962,0.9842613750000359,0.9844037500000317,0.9845433750000666,0.9846784583334132,0.9848192500000247,0.9849635000001096,0.9851024166667534,0.9852415833333604,0.9853761666667803,0.9855155000001105,0.9856558333334154,0.9858045000000857,0.9859326666667282,0.9860735416667012,0.9862108750000819,0.9863520416667597,0.9864897500000855,0.9866300416667703,0.986770166666732,0.9869077916666963,0.9870497500000056,0.9871876250000544,0.9873232916666893,0.9874616666666649,0.9875999583334002,0.9877409166667348,0.9878832916667306,0.98802058333337,0.9881599583334416,0.9882987916667237,0.9884380833334337,0.9885756250000365,0.9887134583333439,0.988851916666681,0.9889943750000384,0.9891314166667143,0.9892688750000768,0.9894173750000239,0.9895476250000986,0.9896862500000376,0.989828208333347,0.9899670833333706,0.9901067916667671,0.9902445833333331,0.9903821666666772,0.9905210416667009,0.9906685833334147,0.9907987500000066,0.9909401666667691,0.9910782500000399,0.9912190833333928,0.9913570833334233,0.9914940416667377,0.9916301666666792,0.9917677083334032,0.9919087500000994,0.9920519583333468,0.9921884166667344,0.9923291250001057,0.9924704583333853,0.9926073750000797,0.992752791666741,0.9928897500000554,0.9930267083333698,0.9931628750000527,0.9933036250000441,0.9934364166667364,0.9935832500000591,0.993724083333412,0.9938591666667587,0.9940046250000402,0.9941406666667414,0.9942753750000217,0.9944224583334289,0.9945588333333338,0.9946950000000166,0.9948308333333746,0.9949745833334115,0.995110708333353,0.9952486666667634,0.9953901666667662,0.995527541666767,0.9956648333334063,0.9958065000000109,0.995943375000085,0.9960857083333394,0.9962217083334205,0.9963592083334031,0.9965078750000733,0.9966345000000729,0.996777125000032,0.9969157916667124,0.9970561666667588,0.9972007083334271,0.9973366250000254,0.9974746250000559,0.9976187500000379,0.9977540000001075,0.9978936666667626,0.9980272916667067,0.9981655000000804,0.9983086250000875,0.998448541666706,0.9985828333334211,0.9987253750000188,0.9988653333333787,0.9990008333334117,0.9991412083333367,0.9992829166666828,0.999421875000068,0.9995424583333564,0.9996816250000847,0.999820458333367,0.9999661666667331,1
  ];
}
