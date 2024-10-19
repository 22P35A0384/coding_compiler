module Adder_4bit (
input [3:0] A,    // 4-bit input A
input [3:0] B,    // 4-bit input B
 output [3:0] Sum  // 5-bit sum to include carry-out
 );
 assign Sum = A + B;
  endmodule
  module Adder_4bit_tb;

 // Inputs
  reg [3:0] A;
  reg [3:0] B;

  // Output
   wire [3:0] Sum;

  // Memory to store input data from file
  reg [7:0] input_data [0:0];  // Array to hold binary inputs from the file

 integer i;  // Index for iterating over the input file

  // Instantiate the Unit Under Test (UUT)
  Adder_4bit uut (
  .A(A),
 .B(B),
.Sum(Sum)
    );
 initial begin
  // Read the file "input.txt" which contains binary numbers
 $readmemb("23mh5a0404_input.txt", input_data);

 // Loop over the input data
 A = input_data[0][7:4];  // Extract bits 7 to 4 for A
  B = input_data[0][3:0];  // Extract bits 3 to 0 for B
   #10;  // Wait for 10 time units
  // End simulation
 // $finish;
 end

   // Monitor changes
   initial begin
 $monitor("%b",Sum);
  end
      endmodule
)