;(function($B){

var _b_ = $B.builtins

function $UnsupportedOpType(op, class1, class2){
    throw _b_.TypeError.$factory("unsupported operand type(s) for " +
        op + ": '" + class1 + "' and '" + class2 + "'")
}

var complex = {
    __class__: _b_.type,
    __dir__: _b_.object.__dir__,
    $infos: {
        __module__: "builtins",
        __name__: "complex"
    },
    $is_class: true,
    $native: true,
    $descriptors: {real: true, imag: true}
}

complex.__abs__ = function(self){
    var _rf = isFinite(self.$real),
        _if = isFinite(self.$imag)
    if((_rf && isNaN(self.$imag)) || (_if && isNaN(self.$real)) ||
        (isNaN(self.$imag) && isNaN(self.$real))){return NaN}
    if(! _rf || ! _if){return Infinity}
    var mag = Math.sqrt(Math.pow(self.$real,2) + Math.pow(self.$imag,2))
    if(!isFinite(mag) && _rf && _if){
        // In these circumstances Math.hypot quietly returns inf, but Python
        // should raise.
        // See https://hg.python.org/jython/rev/69826acfb4a9
        throw _b_.OverflowError.$factory("absolute value too large")
    }
    return mag
}

complex.__add__ = function(self, other){
    if(_b_.isinstance(other, complex)){
        return make_complex(self.$real + other.$real, self.$imag + other.$imag)
    }
    if(_b_.isinstance(other, _b_.int)){
        other = _b_.int.numerator(other)
        return make_complex($B.add(self.$real, other.valueOf()), self.$imag)
    }
    if(_b_.isinstance(other, _b_.float)){
        return make_complex(self.$real + other.valueOf(), self.$imag)
    }
    return _b_.NotImplemented
}

complex.__bool__ = function(self){
    return (self.$real != 0 || self.$imag != 0)
}

complex.__complex__ = function(self){
    return self
}

complex.__eq__ = function(self, other){
    if(_b_.isinstance(other, complex)){
        return self.$real.valueOf() == other.$real.valueOf() &&
            self.$imag.valueOf() == other.$imag.valueOf()
    }
    if(_b_.isinstance(other, _b_.int)){
        if(self.$imag != 0){return false}
        return self.$real == other.valueOf()
    }
    if(_b_.isinstance(other, _b_.float)){
      if(self.$imag != 0){return false}
      return self.$real == other.valueOf()
    }
    return _b_.NotImplemented
}

complex.__hash__ = function(self){
    // this is a quick fix for something like 'hash(complex)', where
    // complex is not an instance but a type
    return self.$imag * 1000003 + self.$real
}

complex.__init__ = function() {
    return _b_.None
}

complex.__invert__ = function(self){return ~self}

complex.__mro__ = [_b_.object]

complex.__mul__ = function(self, other){
    if(_b_.isinstance(other, complex)){
      return make_complex(self.$real * other.$real - self.$imag * other.$imag,
          self.$imag * other.$real + self.$real * other.$imag)
    }else if(_b_.isinstance(other, _b_.int)){
      return make_complex(self.$real * other.valueOf(),
          self.$imag * other.valueOf())
    }else if(_b_.isinstance(other, _b_.float)){
      return make_complex(self.$real * other, self.$imag * other)
    }else if(_b_.isinstance(other, _b_.bool)){
      if(other.valueOf()){return self}
      return make_complex(0, 0)
    }
    $UnsupportedOpType("*", complex, other)
}

complex.__ne__ = function(self, other){
    var res = complex.__eq__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

complex.__neg__ = function(self){
    return make_complex(-self.$real, -self.$imag)
}

complex.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory('complex.__new__(): not enough arguments')
    }
    var res,
        missing = {},
        args = $B.args("complex", 3, {cls: null, real: null, imag: null},
            ["cls", "real", "imag"], arguments, {real: 0, imag: missing},
            null, null),
        $real = args.real,
        $imag = args.imag

    if(typeof $real == "string"){
        if($imag !== missing){
            throw _b_.TypeError.$factory("complex() can't take second arg " +
                "if first is a string")
        }else{
            var arg = $real
            $real = $real.trim()
            if($real.startsWith("(") && $real.endsWith(")")){
                $real = $real.substr(1)
                $real = $real.substr(0, $real.length - 1)
            }
            // Regular expression for literal complex string. Includes underscores
            // for PEP 515
            var complex_re = /^\s*([\+\-]*[0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)([\+\-]?)([0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)(j?)\s*$/i

            var parts = complex_re.exec($real)

            function to_num(s){
                var res = parseFloat(s.charAt(0) + s.substr(1).replace(/_/g, ""))
                if(isNaN(res)){
                    throw _b_.ValueError.$factory("could not convert string " +
                        "to complex: '" + arg +"'")
                }
                return res
            }
            if(parts === null){
                throw _b_.ValueError.$factory("complex() arg is a malformed string")
            }else if(parts[_real] == "." || parts[_imag] == "." ||
                    parts[_real] == ".e" || parts[_imag] == ".e" ||
                    parts[_real] == "e" || parts[_imag] == "e"){
                throw _b_.ValueError.$factory("complex() arg is a malformed string")
            }else if(parts[_j] != ""){
                if(parts[_sign] == ""){
                    $real = 0
                    if(parts[_real] == "+" || parts[_real] == ""){
                        $imag = 1
                    }else if (parts[_real] == '-'){
                        $imag = -1
                    }else{$imag = to_num(parts[_real])}
                }else{
                    $real = to_num(parts[_real])
                    $imag = parts[_imag] == "" ? 1 : to_num(parts[_imag])
                    $imag = parts[_sign] == "-" ? -$imag : $imag
                }
            }else{
                $real = to_num(parts[_real])
                $imag = 0
            }
            res = {
                __class__: complex,
                $real: $real || 0,
                $imag: $imag || 0
            }
            return res
        }
    }

    // If first argument is not a string, the second argument defaults to 0
    $imag = $imag === missing ? 0 : $imag

    if(arguments.length == 2 && $real.__class__ === complex && $imag == 0){
        return $real
    }

    if(_b_.isinstance($real, [_b_.float, _b_.int]) &&
            _b_.isinstance($imag, [_b_.float, _b_.int])){
        res = {
            __class__: complex,
            $real: $real,
            $imag: $imag
        }
        return res
    }

    var real_to_num = $B.to_num($real,
        ["__complex__", "__float__", "__index__"])
    if(real_to_num === null){
        throw _b_.TypeError.$factory("complex() first argument must be a " +
            " string or a number, not '" + $B.class_name($real) +"'")
    }
    $real = real_to_num
    $imag = _convert($imag)
    if(! _b_.isinstance($real, _b_.float) && ! _b_.isinstance($real, _b_.int) &&
            ! _b_.isinstance($real, _b_.complex)){
        throw _b_.TypeError.$factory("complex() argument must be a string " +
            "or a number")
    }
    if(typeof $imag == "string"){
        throw _b_.TypeError.$factory("complex() second arg can't be a string")
    }
    if(! _b_.isinstance($imag, _b_.float) && ! _b_.isinstance($imag, _b_.int) &&
            ! _b_.isinstance($imag, _b_.complex) && $imag !== missing){
        throw _b_.TypeError.$factory("complex() argument must be a string " +
            "or a number")
    }
    $imag = complex.__mul__(complex.$factory("1j"), $imag)
    return complex.__add__($imag, $real)
}

complex.__pos__ = function(self){return self}

function complex2expo(cx){
    var norm = Math.sqrt((cx.$real * cx.$real) + (cx.$imag * cx.$imag)),
        sin = cx.$imag / norm,
        cos = cx.$real / norm,
        angle

    if(cos == 0){angle = sin == 1 ? Math.PI / 2 : 3 * Math.PI / 2}
    else if(sin == 0){angle = cos == 1 ? 0 : Math.PI}
    else{angle = Math.atan(sin / cos)}
    return {norm: norm, angle: angle}
}

complex.__pow__ = function(self, other){
    // complex power : use Moivre formula
    // (cos(x) + i sin(x))**y = cos(xy)+ i sin(xy)
    if(other == 1){
        return self
    }
    var exp = complex2expo(self),
        angle = exp.angle,
        res = Math.pow(exp.norm, other)

    if(_b_.isinstance(other, [_b_.int, _b_.float])){
        return make_complex(res * Math.cos(angle * other),
            res * Math.sin(angle * other))
    }else if(_b_.isinstance(other, complex)){
        // (r*e**Ai)**(x+iy) = (e**iAx)*(e**-Ay)
        var x = other.$real,
            y = other.$imag
        var pw = Math.pow(exp.norm, x) * Math.pow(Math.E, -y * angle),
            theta = y * Math.log(exp.norm) - x * angle
        return make_complex(pw * Math.cos(theta), pw * Math.sin(theta))
    }else{
        throw _b_.TypeError.$factory("unsupported operand type(s) " +
            "for ** or pow(): 'complex' and '" +
            $B.class_name(other) + "'")
    }
}

complex.__radd__ = function(self, other){
    if(_b_.isinstance(other, _b_.bool)){
        other = other ? 1 : 0
    }
    if(_b_.isinstance(other, [_b_.int, _b_.float])){
        return make_complex(other + self.$real, self.$imag)
    }
    return _b_.NotImplemented
}

complex.__repr__ = function(self){
    $B.builtins_repr_check(complex, arguments) // in brython_builtins.js
    var real = _b_.str.$factory(self.$real),
        imag = _b_.str.$factory(self.$imag)
    if(self.$real instanceof Number && self.$real == parseInt(self.$real)){
        // real = _b_.str.$factory(parseInt(self.$real))
    }
    if(self.$imag instanceof Number && self.$imag == parseInt(self.$imag)){
        // imag = _b_.str.$factory(parseInt(self.$imag))
        if(self.$imag == 0 && 1 / self.$imag === -Infinity){
            imag = "-0"
        }
    }
    if(self.$real == 0){
        if(1 / self.$real < 0){
            if(imag.startsWith('-')){
                return "-0" + imag + "j"
            }
            return "-0+" + imag + "j"
        }else{
            return imag + "j"
        }
    }
    if(self.$imag > 0 || isNaN(self.$imag)){
        return "(" + real + "+" + imag + "j)"
    }
    if(self.$imag == 0){
        if(1 / self.$imag < 0){
            return "(" + real + "-0j)"
        }
        return "(" + real + "+0j)"
    }
    return "(" + real + "-" + _b_.str.$factory(-self.$imag) + "j)"
}

complex.__rmul__ = function(self, other){
    if(_b_.isinstance(other, _b_.bool)){
        other = other ? 1 : 0
    }
    if(_b_.isinstance(other, [_b_.int, _b_.float])){
        return make_complex(other * self.$real, other * self.$imag)
    }
    return _b_.NotImplemented
}

complex.__sqrt__ = function(self) {
    if(self.$imag == 0){return complex(Math.sqrt(self.$real))}

    var r = self.$real,
        i = self.$imag,
        _a = Math.sqrt((r + sqrt) / 2),
        _b = Number.sign(i) * Math.sqrt((-r + sqrt) / 2)

    return make_complex(_a, _b)
}

complex.__sub__ = function(self, other){
    if(_b_.isinstance(other, complex)){
        return make_complex(self.$real - other.$real, self.$imag - other.$imag)
    }
    if(_b_.isinstance(other, _b_.int)){
        other = _b_.int.numerator(other)
        return make_complex($B.sub(self.$real, other.valueOf()), self.$imag)
    }
    if(_b_.isinstance(other, _b_.float)){
        return make_complex(self.$real - other.valueOf(), self.$imag)
    }
    return _b_.NotImplemented
}

complex.__truediv__ = function(self, other){
    if(_b_.isinstance(other, complex)){
        if(other.$real == 0 && other.$imag == 0){
           throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        var _num = self.$real * other.$real + self.$imag * other.$imag,
            _div = other.$real * other.$real + other.$imag * other.$imag

        var _num2 = self.$imag * other.$real - self.$real * other.$imag

        return make_complex(_num / _div, _num2 / _div)
    }
    if(_b_.isinstance(other, _b_.int)){
        if(! other.valueOf()){
            throw _b_.ZeroDivisionError.$factory('division by zero')
        }
        return complex.__truediv__(self, complex.$factory(other.valueOf()))
    }
    if(_b_.isinstance(other, _b_.float)){
        if(! other.valueOf()){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return complex.__truediv__(self, complex.$factory(other.valueOf()))
    }
    $UnsupportedOpType("//", "complex", other.__class__)
}

complex.conjugate = function(self) {
    return make_complex(self.$real, -self.$imag)
}

complex.__ior__ = complex.__or__

var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or"]


for(var r_opname of r_opnames){
    if(complex["__r" + r_opname + "__"] === undefined &&
            complex['__' + r_opname + '__']){
        complex["__r" + r_opname + "__"] = (function(name){
            return function(self, other){
                if(_b_.isinstance(other, [_b_.int, _b_.float])){
                    other = make_complex(other, 0)
                    return complex["__" + name + "__"](other, self)
                }else if(_b_.isinstance(other, complex)){
                    return complex["__" + name + "__"](other, self)
                }
                return _b_.NotImplemented
            }
        })(r_opname)
    }
}


// comparison methods
var $comp_func = function(self, other){
    if(other === undefined || other == _b_.None){
        return _b_.NotImplemented
    }
    throw _b_.TypeError.$factory("no ordering relation " +
        "is defined for complex numbers")
}
$comp_func += '' // source code
for(var $op in $B.$comps){
    eval("complex.__" + $B.$comps[$op] + "__ = " +
        $comp_func.replace(/>/gm, $op))
}

// Descriptors to return real and imag
complex.real = function(self){return new Number(self.$real)}
complex.real.setter = function(){
    throw _b_.AttributeError.$factory("readonly attribute")
}
complex.imag = function(self){
    return new Number(self.$imag)
}
complex.imag.setter = function(){
    throw _b_.AttributeError.$factory("readonly attribute")
}

var _real = 1,
    _real_mantissa = 2,
    _sign = 3,
    _imag = 4,
    _imag_mantissa = 5,
    _j = 6
var type_conversions = ["__complex__", "__float__", "__index__"]
var _convert = function(num){
    var klass = num.__class__ || $B.get_class(num)
    for(var i = 0; i < type_conversions.length; i++) {
        var missing = {},
            method = $B.$getattr(klass, type_conversions[i], missing)
        if(method !== missing){
            return method(num)
        }
    }
    return null
}

var make_complex = $B.make_complex = function(real, imag){
    return {
        __class__: complex,
        $real: real,
        $imag: imag
    }
}

complex.$factory = function(){
    return complex.__new__(complex, ...arguments)
}

$B.set_func_names(complex, "builtins")

_b_.complex = complex

})(__BRYTHON__)
