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


function execute(commands) {
    var run = false;

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

    }

}