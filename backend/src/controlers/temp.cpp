#include <iostream>
using namespace std;

int main() {
    // Prices per unit for each ingredient
    int priceA = 10;  // Unicorn Hair
    int priceB = 15;  // Dragon Scale
    int priceC = 20;  // Phoenix Feather
    int priceD = 25;  // Mermaid Tears

    // Quantities of each ingredient
    int A, B, C, D;

    // Input the quantities
    cin >> A >> B >> C >> D;

    // Calculate the total cost
    int totalCost = (A * priceA) + (B * priceB) + (C * priceC) + (D * priceD);

    // Output the total cost
    cout << totalCost << endl;

    return 0;
}
