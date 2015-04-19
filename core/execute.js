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


}
