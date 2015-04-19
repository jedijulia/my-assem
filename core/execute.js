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
    var max_stack_size = 5;

    while(run) {
        var command = memory[program_counter];
        var code = command.substring(0, 2);
        var params = command.substring(2);
        var prev_pc = program_counter;
        this[resolve_code_to_name(code)](params);
        if (program_counter == prev_pc) {
            program_counter += 1;
        }
        if (error != null) {
            alert(error);
        }
    }

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
        if (input.length > 2 || input === NaN) {
            error = "Invalid input.";
            run = false;
            return;
        }
        memory[params] = num;
    }

    function disp(params) {
        if (memory[params] === undefined) {
            error = "Trying to access variable that is not defined!"
            run = false;
            return;
        }
        alert(memory[params]);
    }

    function pushi(params) {
        if (stack.length === max_stack_size) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        stack.push(params)
    }

    function pushv(params) {
        if (memory[params] === undefined) {
            error = "Trying to access variable that is not defined!"
            run = false;
            return;
        }
        if (stack.length === max_stack_size) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        stack.push(memory[params]);
    }

    function pop(params) {
        if (stack.length === 0) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        var num = stack.pop();
        memory[params] = num;
    }

    function mod(params) {
        var stack_size = stack.length;
        if (stack_size < 2) {
            error = "Null Operand!"
            run = false;
            return;
        }
        if (stack_size === max_stack_size) {
            error = "Stack Overflow!"
            run = false;
            return;
        }
        var m = stack[stack_size - 2] % stack[stack_size - 1]
        stack.push(m);
    }

    function jmp(params) {
        program_counter = params;
    }

}
