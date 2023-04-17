# @k8slens/kubectl-versions

This package contains a JSON array of entries of the format ["MAJOR.MINOR", "MAJOR.MINOR.PATCH"].

This object represents the current (at time of building each release of this package)
greatest PATCH version for each "MAJOR.MINOR" version of `kubectl`.
This is done at compile time so that we don't have to worry about being able to access this data on user machines.
Furthermore, this is dynamic in that the previous method was to update the table by hand.
