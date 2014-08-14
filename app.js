;(function() {
  var nativeApp = {
    init: function() {
      this.drawTimeLine();
    },

    //群れの作成
    drawSwarm: function(len, svg) {

      //描画領域設定
      var width = 960,
          height = 500;

      //花火的なやつのために
      var colors = d3.scale.category20b();
      var ci=0;


      //描画要素設定
      var swarm = d3.select("#swarm");
      var svg = swarm
                .append("svg")
                .attr("width", width)
                .attr("height", height);

      //circleが存在していたらsvgを一度削除する
      if(swarm[0][0].childNodes.length < 2) {
        svg.attr("class", 'swarm__svg')
      } else {
        d3.select("#swarm svg").remove();
      }

      //rangeってなんだっけ？
      var data = d3.range(len/100000).map(function() {
        return {xloc: 0, yloc: 0, xvel: 0, yvel: 0};
      });

      //xの何かを取っているはず
      var x = d3.scale.linear()
          .domain([-5, 5])
          .range([0, width]);

      //yの何かを取っているはず
      var y = d3.scale.linear()
          .domain([-5, 5])
          .range([0, height]);

      //circleを作っているんだと思う
      //虫用
      var circle = svg.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", 10)
          .attr("cy", 10)
          .attr("r", 1);

      var line = svg.selectAll("line")
                      .attr("x1",1002).attr("y1",408).attr("x2",1002).attr("y2",408)
                      .style("stroke",colors(++ci)).style("stroke-width", "10px");

      d3.timer(function() {

        //虫みたいな動きのcircle
        // data.forEach(function(d) {
        //   d.xloc += d.xvel;
        //   d.yloc += d.yvel;
        //   d.xvel += 0.04 * (Math.random() - .5) - 0.05 * d.xvel - 0.0005 * d.xloc;
        //   d.yvel += 0.04 * (Math.random() - .5) - 0.05 * d.yvel - 0.0005 * d.yloc;
        // });

        // circle
        //     .attr("transform", function(d) { return "translate(" + x(d.xloc) + "," + y(d.yloc) + ")"; })
        //     .attr("r", function(d) { return Math.min(1 + 1000 * Math.abs(d.xvel * d.yvel), 10); });

        //花火的なやつ
        data.forEach(function(d) {
            var timeScale=1;

            var w = window.innerWidth, h = window.innerHeight;
            var hoge = 480, fuga = 250;
            var fmx = hoge/w, fmy = fuga/h;

            var randx = Math.floor(Math.random()*2000)-1000,
              randy = Math.floor(Math.random()*2000)-1000;
              thunnidx=30, thunnidy=30;
            if (randx < 0){thunnidx *= -1;}
            if (randy < 0){thunnidy*=-1;}
            svg.append("svg:line")
              .attr("x1",w*fmx).attr("y1",h*fmy).attr("x2",w*fmx).attr("y2",h*fmy)
              .style("stroke",colors(++ci)).style("stroke-width", "10px")
              .transition().duration(timeScale*1000).ease(Math.sqrt)
              .attr("x1",w*fmx+randx).attr("y1",h*fmy+randy)
              .attr("x2",w*fmx+randx+thunnidx).attr("y2",h*fmy+randy+thunnidy)
              .style("stroke-opacity",0.1).remove();
        });
      });
    },

    //タイムラインの作成
    drawTimeLine: function() {
      var margin = {top: 20, right: 50, bottom: 30, left: 50},
          width = 670 - margin.left - margin.right,
          height = 195 - margin.top - margin.bottom;

      var parseDate = d3.time.format("%d-%b-%y").parse,
          bisectDate = d3.bisector(function(d) { return d.date; }).left,
          formatValue = d3.format(",.2f"),
          formatCurrency = function(d) { return "$" + formatValue(d); };

      var x = d3.time.scale()
          .range([0, width]);

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

      var line = d3.svg.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.total); });

      var svg = d3.select("#timeline").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      d3.csv("data/group-summary-hbase-daily.csv", function(error, data) {
        data.forEach(function(d) {
          d.date = parseDate(d.date);
          d.total = +d.total;
        });

        data.sort(function(a, b) {
          return a.date - b.date;
        });

        x.domain([data[0].date, data[data.length - 1].date]);
        y.domain(d3.extent(data, function(d) { return d.total; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Appli DAU");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4.5);

        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
          var x0 = x.invert(d3.mouse(this)[0]),
              i = bisectDate(data, x0, 1),
              d0 = data[i - 1],
              d1 = data[i],
              d = x0 - d0.date > d1.date - x0 ? d1 : d0,
              swarmLen = d.total / 10;
          focus.attr("transform", "translate(" + x(d.date) + "," + y(d.total) + ")");
          focus.select("text").text(formatCurrency(d.total));
          nativeApp.drawSwarm(swarmLen, svg);
        }
      });
    }
  }
  nativeApp.init();
})();
