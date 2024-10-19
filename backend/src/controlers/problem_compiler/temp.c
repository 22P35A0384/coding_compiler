#include <stdio.h>
int main()
{
    int a,b,add,subtract,sum, diff;  
    printf("Enter two integers\n");
    scanf("%d%d", &a, &b);
    add        =a + b;
    subtract = a - b;
    printf("Sum = %d\n",add);
    printf("Difference = %d\n",subtract);
    return 0;
}