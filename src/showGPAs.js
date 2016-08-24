// var gtrmp = rmp("Georgia Institute of Technology")

var maxGpa = 4
var baseSaturation = .63
var baseLightness = .42
var endHue = 145/360
var startHue = 6/360

// var teacherElementMap = {//key of teacher last name to elements with teacher DOM points

// }

// var rmpMap = {

// 	/*
// 	teachername: {
// 		dom element,
// 		rank,
// 		done: true/false
// 	}

// 	*/

// }

// var gpaRangeColors = {//if gpa is >= this number, set as this color
// 	3.0: "#2ecc71",//green
// 	2.5: "#f1c40f",//yellow
// 	2.0: "#e67e22",//orange
// 	0: "#e74c3c",//red
// }

function hslToRgb(h, s, l){// from http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(rgbArray){//because the hslToRgb function doesn't put shit in hex

	var res = "#"

	for(var i = 0; i < rgbArray.length; i++){
		var byte = rgbArray[i].toString(16)
		byte = byte.length == 1 ? "0" + byte : byte
		res += byte
	}

	return res
}


if(document.getElementsByClassName('datadisplaytable')){

	var tbodyMain = document.getElementsByClassName('datadisplaytable')[0].childNodes[2]

	var firstRowMain = tbodyMain.childNodes[4]

	var subject = firstRowMain.childNodes[2*2 + 1]
	var number = firstRowMain.childNodes[3*2 + 1]

	var courseName = subject.textContent + number.textContent

	

	loadPage(courseName)

	function getGpaColor(gpa){
		gpa = gpa || 0

		var ratio = gpa / maxGpa

		var h = Math.pow(ratio, 2.5) * (endHue - startHue) + startHue//pow so we have more values closer to green/yellow and hopefully it looks prettier
		// console.log(hslToRgb(h, baseSaturation, baseLightness))
		return rgbToHex(hslToRgb(h, baseSaturation, baseLightness))

	}

	//https://oscar.gatech.edu/pls/bprod/bwskfcls.P_GetCrse

	function addGPA(gpaMap){

		if(!document.getElementsByClassName('datadisplaytable'))
			return

		var tbody = document.getElementsByClassName('datadisplaytable')[0].childNodes[2]

		for(var i = 2*2; i < tbody.childNodes.length; i+=2){

			var teacherColumn = tbody.childNodes[i].childNodes[17*2 + 1]
			var rawTeacherName = teacherColumn.childNodes[0].nodeValue
			
			var teacherName = cleanTeacherName(rawTeacherName)

			// teacherElementMap[teacherName] = teacherElementMap[teacherName] || []

			// teacherElementMap[teacherName].push(teacherColumn)

			teacherColumn.innerHTML += (gpaMap[teacherName]) ? " " + gpaToHTML(gpaMap[teacherName]) : ""
		}

		// console.log(teacherElementMap)

		// for(var teacherName in teacherElementMap){
		// 	gtrmp.get(teacherName, function(professor){
		// 		console.log(professor)
		// 	})
		// }
	}


	function loadPage(courseName){
		httpGetAsync("https://critique.gatech.edu/course.php?id=" + courseName,function(res){

			var parser = new DOMParser()

			var psuedoDoc = parser.parseFromString(res, "text/html")


			var tbody = psuedoDoc.getElementById('dataTable').childNodes[3]

			var gpaMap = {}

			for(var i = 1; i < tbody.childNodes.length; i+=2){
				
				var tr = tbody.childNodes[i]
				
				var rawTeacherName = tr.childNodes[1].childNodes[0].textContent

				var teacherName = cleanTeacherName(rawTeacherName)

				var gpa = parseFloat(tr.childNodes[2*2+1].childNodes[0].textContent)


				gpaMap[teacherName] = gpa


			}


			addGPA(gpaMap)

			
		})
	}


	function httpGetAsync(theUrl, callback){//async code from http://stackoverflow.com/questions/247483/http-get-request-in-javascript
	    var xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
	            callback(xmlHttp.responseText);
	    }
	    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	    xmlHttp.send(null);
	}


	function cleanTeacherName(rawTeacherName){
		return rawTeacherName.replace(/\,.*/gi,"").toUpperCase()
	}

	function emphasize(color, text){
		return "<b style='color: " + color + "'>" + text + "</b>"
	}

	function gpaToHTML(gpa){
		return emphasize(getGpaColor(gpa), gpa)
	}

}
		
