//時計表示
function clock (){
    let nowTime = new Date(); //  現在日時
    let nowHour = nowTime.getHours(); // 時を抜き出す
    nowHour = String(nowHour).padStart(2, '0') // 0を埋めて二桁に
    let nowMin  = nowTime.getMinutes(); // 分を抜き出す
    nowMin = String(nowMin).padStart(2, '0')
    let msg = nowHour + ":" + nowMin ;
    document.getElementById("clock").innerHTML = msg;
}
setInterval('clock()', 10000);
  
//日付表示
function calendar(){
    let nowTime = new Date(); //  現在日時
    let nowMonth = nowTime.getMonth()
    let nowDate = nowTime.getDate()
    let nowDay = nowTime.getDay()
    let dayArray = ["日", "月", "火", "水", "木", "金", "土"]
    let msg = nowMonth + 1  + "月 " + nowDate + "日 " + dayArray[nowDay] + "曜日"
    document.getElementById("calendar").innerHTML = msg;
}
setInterval('calendar()',1000);
  
// txtファイルの読み込み。文字コードはUTF-8であること。
function readTable(path){
    // txtファイルを取得
    let txt = new XMLHttpRequest();
    // texファイルへのパス
    txt.open("GET", path, false); 
    // txtファイル読み込み失敗時のエラー対応
    try {
    txt.send(null);
    } catch (err) {
    console.log(err);
    }
    // console.log(txt)
    // 改行ごとに配列化
    let lines = txt.responseText.split(/\r\n|\n/);
    // console.log(lines) 

    //　大体のDOYくらいを切り出す
    let nowTime = new Date()
    let doyRough = Number(nowTime.getMonth())*30 + Number(nowTime.getDate())
    let startDate
    if (doyRough < 8){
    startDate = 1     
    } else {
    startDate = doyRough -7 
    }

    let endDate
    if (doyRough < 358){
    endDate = doyRough + 7     
    } else {
    endDate = 365
    }

    return lines.slice(startDate, endDate)
}
  
  
function getTideArray(lines){
    // 配列を定義
    let hourlyArray = [];

    //　毎時を処理
    for (let i = 0; i < lines.length-1; ++i) {
    let cells = lines[i].slice(0,72).match(/.{3}/g);
    if (cells.length != 1) {
        hourlyArray.push(cells);
    }
    }
    //　日時の配列を取得
    let dateArray = []
    let tempDay =[]

    for (let i = 0; i < lines.length-1; ++i) {
    let tempYear = 20 + lines[i].slice(72,74)
    let tempMonth = lines[i].slice(74,76) - 1 ; //月は0-23表記
    let tempDate =  lines[i].slice(76,78);

    let hours = [...Array(24)].map((_, i) => i) // 0-23の連番の配列
    tempDay = []
    for(let j = 0; j < 24; ++j){
        tempDay.push(new Date(tempYear, tempMonth, tempDate, hours[j]))
    }
    if (tempDay.length != 1) {
        dateArray.push(tempDay);
    }
    }

    //配列の次元を落とす
    function reshapeArray(array){
    return array.reduce(function (array, cur){
        return array.concat(cur)
    })
    }

    hourlyArray = reshapeArray(hourlyArray)
    dateArray = reshapeArray(dateArray)

    return [dateArray, hourlyArray]
}
  
//現在の潮位の表示 (毎時データを15分で割り算した値)
function tide_now(array){
    let now = new Date(); //  現在日時
    let n_row_now = array[0].findIndex((x) => Date.parse(x) > Date.parse(now));
    let tides_range = array[1].slice(n_row_now-1, n_row_now+1)
    let quater_tide = (tides_range[1] - tides_range[0])/4
    let add_tide = now.getMinutes()/15 | 0
    let tide_now = Number(tides_range[0]) + quater_tide*add_tide | 0
    let ageshio = ""
    if (tides_range[1] - tides_range[0] > 20){
        ageshio = '↑'
    } else if(tides_range[1] - tides_range[0] < -20){
        ageshio = '↓'
    } 
    document.getElementById("tide_now").innerHTML = "<h1>Current Tide Level</h1><h3>現在の潮位</h3>"+'<div class ="col-12 style="text-align:center"><h2>' + tide_now + " cm " + ageshio + "</h2></div>";
}

// グラフを書く
function drawLineChart(array){
    let now = new Date(); //  現在日時
    let n_row_now = array[0].findIndex((x) => Date.parse(x) > Date.parse(now));
    let xlabel = array[0].slice(n_row_now-12, n_row_now+12).map(function(hour){   //前後12時間でグラフを書く
        return hour.getHours()
    })
    let tides = array[1].slice(n_row_now-12, n_row_now+12) //潮位

    //　グラフの描画設定
    let mydata = {
        labels: xlabel, // X軸ラベル
        datasets: [
        {
            data: tides,
            tention: 0.5, //曲線の程度　数字が大きいと曲がる
            fill: false,
            // backgroundColor: "blue",
            hoverBackgroundColor: "rgba(255,99,132,0.5)",
            borderColor: "#0654bb",
            borderWidth: 3, // 線の太さ
            pointRadius: 4, // 点の半径
            pointBackgroundColor: "#0654bb" //点の色

        }
        ]
    };

    //　グラフのオプション（軸、凡例など）設定
    var options = {
        title: {    
        display: false, //タイトル非表示
        },
        legend:{
        display: false //凡例非表示
        },
        scales:{
        xAxes:[
            {
                ticks:{
                    fontColor: "black",  // 色
                    fontSize: 20                
                },
                scaleLabel: {       // X軸のラベル
                    display: true,
                    fontSize: 20,
                    fontColor: "black",
                    labelString: "時刻"
                }
            }
        ],
        yAxes:[
            {
                ticks: {           // Ｙ軸目盛り        
                    min: -50,            // 最小値
                    max: 250,           // 最大値
                    stepSize: 50,       // 間隔
                    fontColor: "black",  // 色
                    fontSize: 20
                },
                gridLines: {        // 水平補助線の定義
                    color: "rgba(0, 0, 255, 0.2)"
                },
                scaleLabel: {       // Ｙ軸のラベル
                    display: true,
                    fontSize: 20,
                    fontColor: "black",
                    labelString: "潮位(cm)",
                    padding:{
                        top:10,
                        bottom:10
                    }
                }

            }
        ]
        }, 
};
    //マウスをかざしたときに出る吹き出しの設定
    options.tooltips = {
        titleFontSize: 20,
        bodyFontSize: 20,
        xPadding: 10,
        yPadding: 10,
        callbacks: {
            title: function(tooltipItem, data) { return tooltipItem[0].xLabel+ '時';},
            label: function(tooltipItem, data) { return '潮位: ' + tooltipItem.yLabel + "cm";}
        } 
    }
    var canvas = document.getElementById('chart');
    canvas.width = 900;
    canvas.height = 600;

    var chart = new Chart(canvas, {

        type: 'line',  //グラフの種類
        data: mydata,  //表示するデータ
        options: options  //オプション設定

    });
} 
 
// その日の満潮時刻と潮位の表示
function tide_high(array){
    let today = new Date().getDate(); //  今日の日
    let dayArray = new Array()
    for(let i=0 ; i < array.length; i++){
        let tempDate =  array[i].slice(76,78);
        tempDate = Number(tempDate)
        dayArray.push(tempDate)
    }
    let n_row_today = dayArray.findIndex((x) => x === today);
    let highTideToday = array[n_row_today].slice(80, 108)
    let lowTideToday = array[n_row_today].slice(108, 136)
    
    let highTide_time_2, highTide_level_2, lowTide_time_2, lowTide_level_2 

    if(highTideToday.slice(7,14) != 9999999){
        highTide_time_2 = [highTideToday.slice(7,9)+ ":" + highTideToday.slice(9,11)]
        highTide_level_2 = [highTideToday.slice(11,14) + 'cm']
    }else{
        highTide_time_2 = "&nbsp"
        highTide_level_2 = "&nbsp"
    }
    
    if(lowTideToday.slice(7,14) != 9999999){
        lowTide_time_2 = [lowTideToday.slice(7,9)+ ":" + lowTideToday.slice(9,11)]
        lowTide_level_2 = [lowTideToday.slice(11,14) + 'cm']
    }else{
        lowTide_time_2 = "&nbsp"
        lowTide_level_2 = "&nbsp"
    }
    
    let highTide_time_1 = [highTideToday.slice(0,2) + ":" + highTideToday.slice(2,4)]
    let lowTide_time_1 = [lowTideToday.slice(0,2) + ":" + lowTideToday.slice(2,4) ]
    
    let highTide_level_1 = [highTideToday.slice(4,7) + "cm"]
    let lowTide_level_1 = [lowTideToday.slice(4,7) + "cm"]

    document.getElementById("high_tide").innerHTML = "<h1>High Tide</h1><h3>満潮</h3>"+'<div class ="col-12" style="text-align:center"><ul><li>' + highTide_time_1 + "&emsp;" + highTide_level_1 + "</li> <li>" + highTide_time_2 + "&emsp;" + highTide_level_2 + "</li></ul></div>" ;
    document.getElementById("low_tide").innerHTML = "<h1>Low Tide</h1><h3>干潮</h3>"+ '<div class ="col-12" style="text-align:center"><ul><li>' + lowTide_time_1 + "&emsp;" + lowTide_level_1 + "</li> <li>" + lowTide_time_2 + "&emsp;" + lowTide_level_2 + "</li></ul></div>" ;

}
  
//月齢計算
function luna_age(path){
    // csvファイルを取得
    let csv = new XMLHttpRequest();
    // texファイルへのパス
    csv.open("GET", path, false); 
    // txtファイル読み込み失敗時のエラー対応
    try {
        csv.send(null);
    } catch (err) {
        console.log(err);
    }

    // 改行ごとに配列化
    let lines = csv.responseText.split(/\r\n|\n/);

    //　大体のDOYくらいを切り出す
    let nowTime = new Date()
    let doyRough = Number(nowTime.getMonth())*30 + Number(nowTime.getDate())
    let startDate
    if (doyRough < 8){
        startDate = 1     
    } else {
        startDate = doyRough -7 
    }

    let endDate
    if (doyRough < 358){
        endDate = doyRough + 7     
    } else {
        endDate = 365
    }

    lines = lines.slice(startDate, endDate)

        // 1行ごとに処理
    let csvArray = []
    for (let i = 1; i < lines.length-1; ++i) {
        let cells = lines[i].split(",").slice(1);
        if (cells.length != 1) {
        csvArray.push(cells);
        }
    }
    let dateArray = []
    for(let j = 0; j < csvArray.length-1; ++j){
        let date = csvArray[j][2]
        dateArray.push(Number(date))
    }

    let n_row_today = dateArray.findIndex((x) => x === nowTime.getDate());
    document.getElementById("luna_age").innerHTML = "<h1>Luna Age</h1><h3>今日の潮</h3>"+ '<div class ="col-12" style="text-align:center"><ul><li>' + shio(csvArray[n_row_today][3]) + "<li> 月齢&emsp;" + csvArray[n_row_today][3] +"</li></ul></div>"
    }

    let shio = function(number){
    if(number < 3 || number >= 29){ return '大潮' }
    else if(number < 7 || number >= 3){ return '中潮' }
    else if(number < 10 || number >= 7){ return '小潮' }
    else if(number < 11 || number >= 10){ return '長潮' }
    else if(number < 12 || number >= 11){ return '若潮' }
    else if(number < 14 || number >= 12){ return '中潮' }
    else if(number < 18 || number >= 14){ return '大潮' }
    else if(number < 22 || number >= 18){ return '中潮' }
    else if(number < 25 || number >= 22){ return '小潮' }
    else if(number < 26 || number >= 25){ return '長潮' }
    else if(number < 27 || number >= 26){ return '若潮' }
    else if(number < 29 || number >= 27){ return '中潮' }
}
    
//ライブ画像更新
function reload(){
    let dateNumber = Date.now()
    document.getElementById('kyouhara').src ='http://www.bousai.okinawa.jp/river/kasen/img_cam/p-15.jpg?'+ dateNumber;
    document.getElementById('kohagura').src ='http://www.bousai.okinawa.jp/river/kasen/img_cam/p-16.jpg?'+ dateNumber;
}