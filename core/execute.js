read*
disp*
pushi*
pushv*
pop*
mod*
jmp*
jl
jg
jeq
add
sub
cmp
begin
end


function execute(memory) {
    var run = true;
    var error = null;
    var program_counter = 0;

    var stack = [];

    function resolve_code_to_name(code) {
        // should return the string name of the function corresponding to the
        // code in the symbol  table
    }

    function begin(params) {
        run = true;
    }

    function end(params) {
        run = false;
    }

    function read(params) {
        var input = prompt("Enter a number");
        var num = parseInt(input)
        if (input.length > 2 || input == NaN) {
            error = "Invalid input.";
            run = false;
            return;
        }
        memory[params] = num;
    }

    function disp(params) {
        if (memory[params] == undefined) {
            error = "Trying to access variable that is not defined!"
            run = false;
            return;
        }
        alert(memory[params]);
    }




    function jl(params) {
        var l = stack.length;
        if (l >= 2 && stack[l-1] < stack[l-2]) {
            jmp(params);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

    function jg(params) {
        var l = stack.length;
        if (l >= 2 && stack[l-1] > stack[l-2]) {
            jmp(params);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

    function jeq(params) {
        var l = stack.length;
        if (l >= 2 && stack[l-1] == stack[l-2]) {
            jmp(params);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

    function add() {
        var l = stack.length;
        if (l >= 2) {
            var sum = stack.pop() + stack.pop();
            if (sum <= 99) {
                pushi(sum);
            } else {
                error = "Overflow Error";
            }
        } else {
            error = "Null Operand Error";
        }
    }

    function sub() {
        var l = stack.length;
        if (l >= 2) {
            var diff = stack.pop() - stack.pop();
            if (diff >= 0) {
                pushi(diff);
            } else {
                error = "Overflow Error";
            }
        } else {
            error = "Null Operand Error";
        }
    }

    function cmp() {
        var l = stack.length;
        if (l >= 2) {
            var a = (stack.pop() == stack.pop()) ? 1 : 0;
            pushi(a);
        } else if (l < 2) {
            error = "Null Compare Error";
        }
    }

}
