const ResourceDisplayDetails: {
	[resourceId: number]: {
		visible: boolean;
		displayName: string;
		url: string;
	};
} = {
	1: {
		visible: true,
		displayName: "Animals",
		url: "/animals",
	},
	2: {
		visible: false,
		displayName: "Departments",
		url: "/departments",
	},
	3: {
		visible: true,
		displayName: "Issues",
		url: "/issues",
	},
	4: {
		visible: false,
		displayName: "Park Locations",
		url: "/locations",
	},
	5: {
		visible: false,
		displayName: "Resources",
		url: "/",
	},
	6: {
		visible: true,
		displayName: "Roles and Departments",
		url: "/roles",
	},
	7: {
		visible: false,
		displayName: "Species",
		url: "/species",
	},
	8: {
		visible: true,
		displayName: "Systems and Park Locations",
		url: "/systems",
	},
	9: {
		visible: true,
		displayName: "Users",
		url: "/users",
	},
	10: {
		visible: true,
		displayName: "Park Vehicles",
		url: "/vehicles",
	},
};

export { ResourceDisplayDetails };
