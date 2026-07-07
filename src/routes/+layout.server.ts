import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({
	locals: { session, user, supabase },
	cookies
}) => {
	let profiel = null;
	if (user) {
		const { data } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();
		profiel = data;
	}

	return {
		session,
		user,
		profiel,
		cookies: cookies.getAll()
	};
};
