function objectLen(obj){
	var count = 0;
	for( var o in obj){
		if(obj.hasOwnProperty(o)){
			count++;
		}
	}
	return count;
}

function isArray(value){
	return Object.prototype.toString.call(value) === '[object Array]';
}


function Postgressa(pg){
	var tableName = null;
	var whereQuery = null;


	this.table = function(name){
		this.tableName = name;
		return this;
		
	}

	this.all = function(types,callback){
		var len = arguments.length;
	
		if(!types){
			//var q = "SELECT * FROM " + this.tableName; 
			//return "SELECT * FROM " + this.tableName;
			//console.log(pg)
			//pg.query(q, callback)
		}else{
			var clause = "";
			for ( var i = 0; i < len; i++ ){
				if(i + 1 != len){
					clause += arguments[i] + ",";
				}else{
					clause += arguments[i];
				}
			}			
			return "SELECT " + clause +" FROM " + this.tableName;
		}

		return "SELECT " + clause +" FROM " + this.tableName;

	

	}

	this.where = function(type, value){
		if(!this.whereQuery){
			this.whereQuery = "SELECT * FROM " + this.tableName + " WHERE " + type + " = " + value;
		}else{
			this.whereQuery += " AND " + type + " = " + value;
		}

		return this;
	}

	this.orderBy = function(name, type){
		type = type || "";
		return "SELECT * FROM " + this.tableName + " ORDER BY " + name + " " +  type;
	}	

	this.get = function(){
		return this.whereQuery;
	}

	this.insert = function(data){
		var types = [],
			values = []
		;
		for (obj in data){
			types.push(obj)
			values.push(data[obj]);
		}

		return "INSERT INTO " + this.tableName + "(" + types.toString() 
				+ ") VALUES (" + values.toString() + ")"; 
	}

	this.delete = function(obj){
		var deleteTable = "DELETE FROM " + this.tableName;
		
		if(!obj){
			return deleteTable;
		}else{
			var types = [],
				values = []
			;	
			for( o in obj ){
				types.push(o);
				values.push(obj[o]);
			}

			if(types.length == 1 ){
				if(!isArray(values[0])){
					return deleteTable +
				  	 	" WHERE " + types.toString() + " = " + values.toString();
				}else{

					return deleteTable +
						 " WHERE " + types.toString() + " " + values[0][0] + " " + values[0][1];
				}
				
			}else{
	
				var s = "";
				for( var i = 0; i < types.length; i++ ){
					var keyword = (i == 0) ? " WHERE " : " AND ";
					currentVal = values[i]; 
					if(!isArray(currentVal)){
						s += keyword + types[i] + " = "+ currentVal;
					}else{
						s += keyword +  types[i] + " " + currentVal[0] + " " + currentVal[1];
					}
				}
				return deleteTable + s;
			}

			
		}
	}

	this.update = function(obj){
		var firstPart = "UPDATE " + this.tableName + " SET ";
		if(obj){
			console.log(objectLen(obj))
			var q = "" ;
			count = 1;
			for (o in obj){
				q +=  o + " = " + obj[o];
				if(count != objectLen(obj)){
					q +=  ", ";
				}
				count++;
			}
			return firstPart + q;
			
		}else{
			return firstPart;
		}
	}
}

var types = {
	"string": "varchar",
	"integer": "int",
	"bigInteger": "bigint"
}


Postgressa.prototype.create = function(tableName, obj){
	var q = "CREATE TABLE IF NOT EXISTS " + tableName + " (id serial, ";

	h = "";
	var len = objectLen(obj);
	var count = 0;
	for( index in obj){
		count++;
		if(index == "primary"){
			
		}

		var breakLine = (count == len) ? " " : ", ";
		//console.log(obj[index])
		if(typeof(obj[index]) == "string"){
			var type = types[obj[index]] ? types[obj[index]] : obj[index];

			if(obj[index] == "timestamp"){
				h += index + " "  + type + " not null DEFAULT NOW(), "
			}else if(index == "primary"){
				h += "PRIMARY KEY("+ type + ")";
			}else{
				h += index + " "  + type + breakLine;
			}
		}else{
			h += index + " ";
			for( i in obj[index]){
				var current = obj[index][i]; 
				var t ;
				if(types[current]){
					if(current == "string"){
						t = types[current] + "(";
					}else{
						t = types[current] + " "
					}
					
				}else{
					if(i == "default"){
						t = i + " " + current;
					}else{
						t = current + ")";
					}
				}
				
				h += t + "";
			}
			h += breakLine;
		}

	}

	return q + h + ")";
	
}

module.exports = Postgressa;

