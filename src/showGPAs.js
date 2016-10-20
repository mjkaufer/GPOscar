var maxGpa = 4
var baseSaturation = .63
var baseLightness = .42
var endHue = 145/360
var startHue = 6/360


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

		return rgbToHex(hslToRgb(h, baseSaturation, baseLightness))

	}

	//https://oscar.gatech.edu/pls/bprod/bwskfcls.P_GetCrse

	function addGPA(gpaMap){//appends GPA to teacher elements

		if(!document.getElementsByClassName('datadisplaytable'))
			return

		var tbody = document.getElementsByClassName('datadisplaytable')[0].childNodes[2]

		for(var i = 2*2; i < tbody.childNodes.length; i+=2){

			var teacherColumn = tbody.childNodes[i].childNodes[16*2 + 1]
			var rawTeacherName = teacherColumn.childNodes[0].nodeValue
			// console.log(rawTeacherName)
			var teacherName = cleanOscarTeacherName(rawTeacherName)
			// console.log(teacherName)

			teacherColumn.innerHTML += (gpaMap[teacherName]) ? " " + gpaToHTML(gpaMap[teacherName]) : ""
		}

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
				console.log(rawTeacherName)
				var teacherName = cleanCritiqueTeacherName(rawTeacherName)

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


	function cleanOscarTeacherName(rawTeacherName){
		// return rawTeacherName.replace(/\,.*/gi,"").toUpperCase()//they changed the formatting on us
		var splitName = rawTeacherName.split(/ */);
		return splitName[splitName.length - 2].toUpperCase()
	}

	function cleanCritiqueTeacherName(rawTeacherName){
		return rawTeacherName.replace(/\,.*/gi,"").toUpperCase()
	}

	function emphasize(color, text){
		return "<b style='color: " + color + "'>" + text + "</b>"
	}

	function gpaToHTML(gpa){
		return emphasize(getGpaColor(gpa), gpa)
	}

}
		
