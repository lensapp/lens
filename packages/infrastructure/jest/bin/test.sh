jest --coverage --runInBand
result=$?

[ $result != 0 ] && [ -v $CI ] && open ./coverage/lcov-report/index.html

exit $result
