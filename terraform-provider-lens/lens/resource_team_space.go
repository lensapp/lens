package lens

import (
	"context"
	"time"

	"github.com/hashicorp/terraform-plugin-sdk/v2/diag"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/schema"
)

func resourceTeamSpace() *schema.Resource {
	return &schema.Resource{
		CreateContext: resourceTeamSpaceCreate,
		ReadContext:   resourceTeamSpaceRead,
		UpdateContext: resourceTeamSpaceUpdate,
		DeleteContext: resourceTeamSpaceDelete,
		Schema: map[string]*schema.Schema{
			"name": {
				Type:        schema.TypeString,
				Required:    true,
				Description: "The name of the Team Space.",
			},
			"description": {
				Type:        schema.TypeString,
				Optional:    true,
				Description: "The description of the Team Space.",
			},
			"members": {
				Type:        schema.TypeList,
				Optional:    true,
				Description: "List of member IDs or emails to associate with the Team Space.",
				Elem: &schema.Schema{
					Type: schema.TypeString,
				},
			},
			"last_updated": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Timestamp of the last update.",
			},
		},
	}
}

func resourceTeamSpaceCreate(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*Client)

	// Warning: members handle might need specific logic (e.g. separate API calls)
	// assuming the Create API accepts them.
	var members []string
	if v, ok := d.GetOk("members"); ok {
		for _, member := range v.([]interface{}) {
			members = append(members, member.(string))
		}
	}

	ts := TeamSpace{
		Name:        d.Get("name").(string),
		Description: d.Get("description").(string),
		Members:     members,
	}

	o, err := c.CreateTeamSpace(ts)
	if err != nil {
		return diag.FromErr(err)
	}

	d.SetId(o.ID)

	resourceTeamSpaceRead(ctx, d, m)

	return nil
}

func resourceTeamSpaceRead(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*Client)

	teamSpaceID := d.Id()

	ts, err := c.GetTeamSpace(teamSpaceID)
	if err != nil {
		return diag.FromErr(err)
	}

	d.Set("name", ts.Name)
	d.Set("description", ts.Description)
	d.Set("members", ts.Members)

	return nil
}

func resourceTeamSpaceUpdate(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*Client)

	teamSpaceID := d.Id()

	if d.HasChange("name") || d.HasChange("description") || d.HasChange("members") {
		var members []string
		if v, ok := d.GetOk("members"); ok {
			for _, member := range v.([]interface{}) {
				members = append(members, member.(string))
			}
		}

		ts := TeamSpace{
			Name:        d.Get("name").(string),
			Description: d.Get("description").(string),
			Members:     members,
		}

		_, err := c.UpdateTeamSpace(teamSpaceID, ts)
		if err != nil {
			return diag.FromErr(err)
		}

		d.Set("last_updated", time.Now().Format(time.RFC850))
	}

	return resourceTeamSpaceRead(ctx, d, m)
}

func resourceTeamSpaceDelete(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*Client)
	teamSpaceID := d.Id()

	err := c.DeleteTeamSpace(teamSpaceID)
	if err != nil {
		return diag.FromErr(err)
	}

	d.SetId("")

	return nil
}
