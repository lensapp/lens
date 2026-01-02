# Terraform Provider for Lens

This is a Terraform Provider for managing Lens Team Spaces.

## Requirements

- [Terraform](https://www.terraform.io/downloads.html) >= 0.13.x
- [Go](https://golang.org/doc/install) >= 1.20

## Building The Provider

Clone repository to: `$GOPATH/src/github.com/lensapp/terraform-provider-lens`

```sh
$ mkdir -p $GOPATH/src/github.com/lensapp; cd $GOPATH/src/github.com/lensapp
$ git clone git@github.com:lensapp/terraform-provider-lens.git
$ cd terraform-provider-lens
$ go build
```

## Using the provider

```hcl
provider "lens" {
  token = "your-lens-access-token"
}

resource "lens_team_space" "team" {
  name        = "dev-team"
  description = "Team Space for Developers"
  members     = ["user1@example.com", "user2@example.com"]
}
```
